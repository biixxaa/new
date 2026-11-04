import app from './app.js';
import { initDb } from './db/index.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔮  Initializing Illuminati Membership Backend...');
    await initDb();

    app.listen(PORT, () => {
      console.log(`👁️   Illuminati Membership Backend listening on port ${PORT}`);
      console.log(`🌐  API Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('💥  Failed to awaken the Sanctum server:', err);
    process.exit(1);
  }
}

startServer();

