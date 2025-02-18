import { createClient, RedisClientType } from 'redis';
import { Redis } from "../../config";


class RedisStorage {
    private static instance: RedisStorage;
    private storage: any;
    private connectionTimeout: NodeJS.Timeout | undefined;

    private constructor() {
        this.storage = createClient(Redis.OPTIONS_DEV);
        this.handleEvents();
    }

    public static getInstance(): RedisStorage {
        if (!RedisStorage.instance) {
            RedisStorage.instance = new RedisStorage();
        }
        return RedisStorage.instance;
    }

    private handleEvents() {
        if (!this.storage) return;

        this.storage.on(Redis.STATUS_REDIS_CONNECT.CONNECT, () => {
            console.log('REDIS - connected successfully!');
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        });

        this.storage.on(Redis.STATUS_REDIS_CONNECT.RE_CONNECT, () => {
            console.log('REDIS - trying to reconnect to Redis!');
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        });

        this.storage.on(Redis.STATUS_REDIS_CONNECT.END, () => {
            console.log('REDIS - connection ended!');
            this.handleTimeoutError();
        });

        this.storage.on(Redis.STATUS_REDIS_CONNECT.ERROR, (err: any) => {
            console.error('REDIS - error!', err);
            this.handleTimeoutError();
        });
    }

    private handleTimeoutError() {
        this.connectionTimeout = setTimeout(() => {
            throw new Error('REDIS - Connection timeout');
        }, Redis.REDIS_CONNECT_TIMEOUT);
    }

    public async connect(): Promise<void> {
        if (!this.storage) {
            throw new Error('REDIS - Client is not initialized!');
        }
        await this.storage.connect();
    }

    public getStorage(): RedisClientType{
        return this.storage;
    }

    public async disconnect(): Promise<void> {
        if (this.storage) {
            await this.storage.disconnect();
        }
    }
}

const redisStorage = RedisStorage.getInstance()
export default {RedisStorage, redisStorage}


