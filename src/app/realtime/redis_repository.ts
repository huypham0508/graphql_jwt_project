import { RedisClientType } from "redis";
import { Event } from "src/app/types/system/Events";
import RedisStorage from "../services/redis_store.service";

export default class RedisRepository {
    private static instance: RedisRepository;
    private TIME_SESSION = 1800;

    private constructor() {}

    /**
     * Get the Singleton instance of RedisRepository.
     * @returns The single instance of RedisRepository.
     */
    public static getInstance(): RedisRepository {
        if (!RedisRepository.instance) {
            RedisRepository.instance = new RedisRepository();
        }
        return RedisRepository.instance;
    }

    private getRedisInstance(): RedisClientType {
        return RedisStorage.getInstance().getStorage();
    }

    /**
     * Store a session in Redis.
     * @param key - The session key.
     * @param data - The data to be stored (in object format).
     */
    public async setSession(key: string, data: object): Promise<void> {
        const redis = this.getRedisInstance();
        const value = JSON.stringify(data);
        const dummyEvent = JSON.stringify([])
        await redis.setEx(`session:${key}`, this.TIME_SESSION, value);
        await redis.setEx(`events:${key}`, this.TIME_SESSION, dummyEvent);
    }

    /**
     * Retrieve a session from Redis.
     * @param key - The session key.
     * @returns The session data or null if not found.
     */
    public async getSession(key: string): Promise<object | null> {
        const redis = this.getRedisInstance();
        const value = await redis.get(`session:${key}`);
        return value ? JSON.parse(value) : null;
    }

    /**
     * Retrieve all matching sessions.
     * @returns A list of sessions as a Map of key to session data.
     */
    public async getAllSessions(): Promise<Map<string, object>> {
        const pattern: string = 'session:*';
        const redis = this.getRedisInstance();
        const sessions = new Map<string, object>();
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

    public async setEvent(event: Event) {
        const redis = this.getRedisInstance();
        const pattern = "events:*";
        let cursor = 0;
        do {
            const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 10 });
            cursor = Number(result.cursor);
            const keys = result.keys;

            for (const key of keys) {
                const getOldEvent = await this.getEvent(key);
                const getAllEvent = await this.getEvents(key, -1)
                const id = getOldEvent && typeof getOldEvent.id === 'number' ? getOldEvent.id + 1 : 0;
                const newEvent = {...event, id: id}
                const value = JSON.stringify([...getAllEvent, ...[newEvent]]);
                await redis.set(key, value, { KEEPTTL: true });
                console.log({key, value, id});
            }
        } while (cursor !== 0);
    }

    public async getEvent(key: string): Promise<Event | undefined> {
        key = key.replace("events:", "")
        try {
            const redis = this.getRedisInstance();
            const value = await redis.get(`events:${key}`);
            return value ? JSON.parse(value).pop() : null;
        } catch (error) {
            console.log("get event" + error.message);
            return undefined;
        }
    }

    public async getEvents(key: string, last_event_id: number | undefined): Promise<Event[]>{
        key = key.replace("events:", "")
        try {
            if (typeof last_event_id === "number") {
                const redis = this.getRedisInstance();
                const value = await redis.get(`events:${key}`);
                if (value) {
                    const events = JSON.parse(value);
                    if (Array.isArray(events)) {
                        return events.filter((event => event.id > last_event_id))
                    }
                    return []
                }
                return [];
            }
            return [];
        } catch (error) {
            console.log("get events" + error.message);
            return [];
        }
    }
}
