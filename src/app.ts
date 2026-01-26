import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

// Application Routes
app.get('/', (req: Request, res: Response) => {
  res.send('FoodHub Backend is Running!');
});

export default app;