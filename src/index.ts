import express from 'express';
import { RedisService } from './services/redis.service';

const app = express();
const PORT = 3000;

(async () => {
  await RedisService.connect();
})();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
