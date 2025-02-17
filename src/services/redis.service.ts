import { createClient } from 'redis';
import { RedisConfig } from '../config/redis.config';

export class RedisService {
  private static client = createClient(RedisConfig.OPTIONS_DEV);

  static async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
      console.log('✅ Connected to Redis');
    }
  }

  static async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  static async get(key: string) {
    return await this.client.get(key);
  }
}
