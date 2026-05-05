import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../shared/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export const askTutorService = async (
  userMessage: string,
  history: any[] = [],
) => {
  // 1. Turn the user's question into vectors
  const embedResult = await embedModel.embedContent(userMessage);
  const queryVector = embedResult.embedding.values;
  const vectorString = `[${queryVector.join(",")}]`;

  // 2. THE SENIOR RETRIEVAL: Find top 4 matching meals
  const relevantChunks = await prisma.$queryRaw<any[]>`
    SELECT 
      "content", 
      "metadata",
      (embedding <=> ${vectorString}::vector) as distance
    FROM "document_embeddings"
    WHERE "sourceType" = 'MEAL' 
      AND "isDeleted" = false
    ORDER BY distance ASC
    LIMIT 4;
  `;

  // 3. Assemble the verified database context
  const contextString = relevantChunks
    .map((chunk) => chunk.content)
    .join("\n\n");

  // 4. THE LEASH (System Prompt)
  // This strict prompt forces the AI to ONLY recommend actual food in your database.
  const augmentedPrompt = `
    You are an enthusiastic and highly knowledgeable Food Assistant for "FoodHub".
    Your goal is to help customers find the perfect meal, answer questions about the menu, and provide recommendations based ONLY on the provided context below.

    Rules:
    1. Only recommend meals listed in the context.
    2. Always mention the price when recommending a specific meal.
    3. If the user asks for something that is NOT in the context, politely apologize and suggest the closest alternative from the context.
    4. Keep your responses concise, appetizing, and friendly.

    DATABASE CONTEXT (Available Meals):
    """
    ${contextString}
    """

    USER QUESTION:
    "${userMessage}"
  `;

  // Ensure history is formatted correctly for Gemini
  const safeHistory = (history || []).filter((msg: any) => {
    return msg?.parts?.[0]?.text && msg.parts[0].text.trim() !== "";
  });

  // 5. Generate and return response
  const chat = chatModel.startChat({ history: safeHistory });
  const result = await chat.sendMessage(augmentedPrompt);

  return result.response.text();
};
