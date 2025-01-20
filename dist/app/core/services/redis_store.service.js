"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_1 = require("../../config");
class RedisStorage {
    constructor() {
        this.storage = (0, redis_1.createClient)(config_1.Redis.OPTIONS_DEV);
        this.handleEvents();
    }
    static getInstance() {
        if (!RedisStorage.instance) {
            RedisStorage.instance = new RedisStorage();
        }
        return RedisStorage.instance;
    }
    handleEvents() {
        if (!this.storage)
            return;
        this.storage.on(config_1.Redis.STATUS_REDIS_CONNECT.CONNECT, () => {
            console.log('REDIS - connected successfully!');
            if (this.connectionTimeout)
                clearTimeout(this.connectionTimeout);
        });
        this.storage.on(config_1.Redis.STATUS_REDIS_CONNECT.RE_CONNECT, () => {
            console.log('REDIS - trying to reconnect to Redis!');
            if (this.connectionTimeout)
                clearTimeout(this.connectionTimeout);
        });
        this.storage.on(config_1.Redis.STATUS_REDIS_CONNECT.END, () => {
            console.log('REDIS - connection ended!');
            this.handleTimeoutError();
        });
        this.storage.on(config_1.Redis.STATUS_REDIS_CONNECT.ERROR, (err) => {
            console.error('REDIS - error!', err);
            this.handleTimeoutError();
        });
    }
    handleTimeoutError() {
        this.connectionTimeout = setTimeout(() => {
            throw new Error('REDIS - Connection timeout');
        }, config_1.Redis.REDIS_CONNECT_TIMEOUT);
    }
    async connect() {
        if (!this.storage) {
            throw new Error('REDIS - Client is not initialized!');
        }
        await this.storage.connect();
    }
    getStorage() {
        return this.storage;
    }
    async disconnect() {
        if (this.storage) {
            await this.storage.disconnect();
        }
    }
}
const redisStorage = RedisStorage.getInstance();
exports.default = { RedisStorage, redisStorage };
//# sourceMappingURL=redis_store.service.js.map