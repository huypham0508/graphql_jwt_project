import { RedisClientType } from "redis";

import redis from "../services/redis_store.service";

import { Event, RedisSession } from "src/app/core/types/system/Events";

class RedisRepository {
    private TIME_SESSION = 1800;

    private getRedisInstance(): RedisClientType {
        return redis.redisStorage.getStorage();
    }

    /**
     * Store a session in Redis.
     * @param key - The session key.
     * @param data - The data to be stored (in object format).
     */
    public async setSession(key: string, data: RedisSession): Promise<void> {
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
    public async getSession(key: string): Promise<RedisSession | null> {
        key = key.replace("session:", "")
        key = key.replace("events:", "")
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

    public async setEvents(event: Event): Promise<void> {
        const redis = this.getRedisInstance();
        const pattern = "events:*";
        const recipients = event.recipients;
        let cursor = 0;
        do {
            const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 10 });
            cursor = Number(result.cursor);

            const tasks = result.keys.map(async key => {
                if (recipients !== "all" && Array.isArray(recipients)) {
                    const session = await this.getSession(key);
                    if (session != null && recipients.includes(session.user_id)) {
                        await this.addEvent(key, event);
                    }
                } else if(recipients === "all"){
                    await this.addEvent(key, event);
                }
            });

            await Promise.all(tasks);
        } while (cursor !== 0);
    }

    public async addEvent(key: string, event: Event): Promise<void> {
        const redis = this.getRedisInstance();
        const existingEvents = await this.getEvents(key, -1);
        const newEventId = existingEvents.length > 0 ? existingEvents[existingEvents.length - 1].id + 1 : 0;
        const newEvent = { ...event, id: newEventId };
        const updatedEvents = [...existingEvents, newEvent];
        const value = JSON.stringify(updatedEvents);
        await redis.set(key, value, { KEEPTTL: true });
    }

    public async getEvent(key: string): Promise<Event | undefined> {
        key = key.replace("session:", "")
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

    public async getEvents(key: string, last_event_id: number = -1): Promise<Event[]>{
        const redis = this.getRedisInstance();
        const sanitizedKey = key.replace(/^events:|^session:/, "");
        try {
            const value = await redis.get(`events:${sanitizedKey}`);
            if (value) {
                const events: Event[] = JSON.parse(value);
                return Array.isArray(events)
                    ? events.filter(event => event.id > last_event_id)
                    : [];
            }
            return [];
        } catch (error) {
            console.error(`Error fetching events for key "${sanitizedKey}": ${error.message}`);
            return [];
        }
    }

    public async resetTimeSession(key: string) {
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
const redisRepository = new RedisRepository();

export {RedisRepository, redisRepository}