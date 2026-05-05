import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function main() {
  console.log('🌱 Starting AI Vector Seeding for FoodHub...');

  // Ensure pgvector extension exists
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
  
  // Update column type (if not already done by Prisma migrations)
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "document_embeddings" ALTER COLUMN "embedding" TYPE vector(3072);'
  );
  
  // Optional: Clear old data during testing
  // await prisma.documentEmbedding.deleteMany({});
  // console.log('🧹 Cleared old vector data...');

  // 1. Fetch all meals WITH their category and provider info
  const meals = await prisma.meal.findMany({
    where: { isDeleted: false },
    include: {
      category: true,
      provider: true,
    }
  });
  
  console.log(`Found ${meals.length} meals to vectorize.`);

  for (const meal of meals) {
    // 2. Prevent duplicates
    const chunkKey = `meal_summary_${meal.id}`;
    const existing = await prisma.documentEmbedding.findUnique({
      where: { chunkKey: chunkKey },
    });

    if (existing) {
      console.log(`⏭️ Skipping "${meal.name}" - Already vectorized.`);
      continue;
    }

    // 3. Create the rich text "chunk" that the AI will read and understand
    const restaurantName = meal.provider.restaurantName || 'Our Partner Restaurant';
    const categoryName = meal.category?.name || 'General';
    
    const chunkText = `Meal: ${meal.name}. Category: ${categoryName}. Restaurant: ${restaurantName}. Description: ${meal.description || 'No description provided.'} Price: $${meal.price}.`;

    try {
      // 4. Send the text to Gemini to get the vector embeddings
      const embedResult = await embedModel.embedContent(chunkText);
      const vectorString = `[${embedResult.embedding.values.join(',')}]`;

      // 5. Create the base record safely using Prisma
      const newDoc = await prisma.documentEmbedding.create({
        data: {
          chunkKey: chunkKey,
          sourceType: 'MEAL',
          sourceId: meal.id,
          sourceLabel: meal.name,
          content: chunkText,
          // Storing metadata allows your frontend to show rich UI cards in the chat!
          metadata: {
            name: meal.name,
            price: meal.price,
            imageUrl: meal.imageUrl,
            category: categoryName,
            restaurant: restaurantName
          },
        },
      });

      // 6. Update the record with the raw vector math
      await prisma.$executeRaw`
        UPDATE "document_embeddings" 
        SET embedding = ${vectorString}::vector 
        WHERE id = ${newDoc.id}
      `;

      console.log(`✅ Successfully vectorized: ${meal.name}`);
    } catch (error) {
      console.error(`❌ Failed to vectorize ${meal.name}:`, error);
    }
  }

  console.log('🎉 Seeding complete! FoodHub AI is now hungry for questions.');
}

main()
  .catch((e) => {
    console.error('Fatal Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });