"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisRepository = exports.RedisRepository = void 0;
const redis_store_service_1 = __importDefault(require("../services/redis_store.service"));
class RedisRepository {
    constructor() {
        this.TIME_SESSION = 1800;
    }
    getRedisInstance() {
        return redis_store_service_1.default.redisStorage.getStorage();
    }
    async setSession(key, data) {
        const redis = this.getRedisInstance();
        const value = JSON.stringify(data);
        const dummyEvent = JSON.stringify([]);
        await redis.setEx(`session:${key}`, this.TIME_SESSION, value);
        await redis.setEx(`events:${key}`, this.TIME_SESSION, dummyEvent);
    }
    async getSession(key) {
        key = key.replace("session:", "");
        key = key.replace("events:", "");
        const redis = this.getRedisInstance();
        const value = await redis.get(`session:${key}`);
        return value ? JSON.parse(value) : null;
    }
    async getAllSessions() {
        const pattern = 'session:*';
        const redis = this.getRedisInstance();
        const sessions = new Map();
        let cursor = 0;
        do {
            const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 10 });
            cursor = Number(result.cursor);
            const keys = result.keys;
            for (const key of keys) {
                const value = await redis.get(key);
                if (value) {
                    sessions.set(key, JSON.parse(value));
                }
            }
        } while (cursor !== 0);
        return sessions;
    }
    async setEvents(event) {
        const redis = this.getRedisInstance();
        const pattern = "events:*";
        const recipients = event.recipients;
        let cursor = 0;
        do {
            const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 10 });
            cursor = Number(result.cursor);
            const tasks = result.keys.map(async (key) => {
                if (recipients !== "all" && Array.isArray(recipients)) {
                    const session = await this.getSession(key);
                    if (session && recipients.includes(session.user_id)) {
                        await this.addEvent(key, event);
                    }
                }
                else if (recipients === "all") {
                    await this.addEvent(key, event);
                }
            });
            await Promise.all(tasks);
        } while (cursor !== 0);
    }
    async addEvent(key, event) {
        const redis = this.getRedisInstance();
        const existingEvents = await this.getEvents(key, -1);
        const newEventId = existingEvents.length > 0 ? existingEvents[existingEvents.length - 1].id + 1 : 0;
        const newEvent = Object.assign(Object.assign({}, event), { id: newEventId });
        const updatedEvents = [...existingEvents, newEvent];
        const value = JSON.stringify(updatedEvents);
        await redis.set(key, value, { KEEPTTL: true });
    }
    async getEvent(key) {
        key = key.replace("session:", "");
        key = key.replace("events:", "");
        try {
            const redis = this.getRedisInstance();
            const value = await redis.get(`events:${key}`);
            return value ? JSON.parse(value).pop() : null;
        }
        catch (error) {
            console.log("get event" + error.message);
            return undefined;
        }
    }
    async getEvents(key, last_event_id = -1) {
        const redis = this.getRedisInstance();
        const sanitizedKey = key.replace(/^events:|^session:/, "");
        try {
            const value = await redis.get(`events:${sanitizedKey}`);
            if (value) {
                const events = JSON.parse(value);
                return Array.isArray(events)
                    ? events.filter(event => event.id > last_event_id)
                    : [];
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching events for key "${sanitizedKey}": ${error.message}`);
            return [];
        }
    }
    async resetTimeSession(key) {
        const redis = this.getRedisInstance();
        const sessionExists = await redis.exists(`session:${key}`);
        const eventExists = await redis.exists(`events:${key}`);
        if (sessionExists) {
            redis.expire(`session:${key}`, this.TIME_SESSION);
        }
        if (eventExists) {
            redis.expire(`events:${key}`, this.TIME_SESSION);
        }
    }
}
exports.RedisRepository = RedisRepository;
const redisRepository = new RedisRepository();
exports.redisRepository = redisRepository;
//# sourceMappingURL=redis_repository.js.map