import { RedisClientOptions } from 'redis';

export class RedisConfig {
  public static OPTIONS_DEV: RedisClientOptions = {
    socket: {
      host: 'localhost',
      port: 6379,
    },
  };
}