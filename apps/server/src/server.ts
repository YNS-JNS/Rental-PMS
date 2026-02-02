import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

// 1. Validate Env & 2. Connect to Database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express Server
    app.listen(env.PORT, () => {
      console.log(`\n✅ Server is running on http://localhost:${env.PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();
