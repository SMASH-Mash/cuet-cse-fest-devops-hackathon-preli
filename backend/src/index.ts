import express from 'express';
import mongoose from 'mongoose';
import productsRouter from './routes/products';
import { envConfig } from './config/envConfig';
import { connectDB } from './config/db';

const app = express();

app.use(express.json());

// Simple request logger for debugging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ensure strictQuery = true (recommended for Mongoose >= 6)
mongoose.set('strictQuery', true);

async function startServer(): Promise<void> {
  await connectDB();

  app.use('/api/products', productsRouter);

  // Check DB connection health
  app.get('/api/health', (_req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
      ok: true,
      database: isDbConnected ? 'connected' : 'disconnected',
    });
  });

  const port = envConfig.port || 3847;
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Backend failed to start:', err);
  process.exit(1);
});
