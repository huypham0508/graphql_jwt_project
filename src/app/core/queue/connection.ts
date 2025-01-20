import { Event } from "src/app/core/types/system/Events";
import {RedisRepository, redisRepository as instanceRedisRepository} from "./redis_repository";
import { ConnectionType } from "../types/system/Connection";

class ConnectionManager {
    private connectionMap = new Map<string, ConnectionType>();
    private redisRepository: RedisRepository;

    constructor() {
       this.redisRepository = instanceRedisRepository;
    }

    public async hasSession(key: string): Promise<boolean> {
        return await this.redisRepository.getSession(key) !== null;
    }

    public appendConnection(queue_id: string, connection: ConnectionType) {
        this.connectionMap.set(queue_id, connection);
        this.redisRepository.resetTimeSession(queue_id)
    }

    public removeConnection(queue_id: string) {
        this.connectionMap.delete(queue_id);
    }

    public getConnection(queue_id: string): ConnectionType | undefined {
        return this.connectionMap.get(queue_id)
    }

    public getAllConnections(): ConnectionType[] {
        return Array.from(this.connectionMap.values());
    }

    public addEventToConnections(event: Event): void {
        this.redisRepository.setEvents(event);
    }

    public getEventsFromConnection(key: string, last_event_id: number | undefined) : Promise<Event[]> {
        return this.redisRepository.getEvents(key, last_event_id);
    }

    public async emitEventToConnections(recipients: any[] | any): Promise<void>  {
        const connections = this.getAllConnections().filter(connection =>
            recipients === "all" || (Array.isArray(recipients) && recipients.includes(connection.user_id))
        );

        await Promise.all(
            connections.map(async connection => {
                const events = await this.redisRepository.getEvents(connection.queue_id, connection.last_event_id);
                if (events.length) {
                    connection.res.status(200).json({ success: true, data: events });
                    clearTimeout(connection.timeoutId);
                    this.removeConnection(connection.queue_id);
                }
            })
        );
    }

    public async doEvents(eventData: Event): Promise<void> {
        await this.redisRepository.setEvents(eventData);
        await this.emitEventToConnections(eventData.recipients);
    }
}
const connectionManager = new ConnectionManager();

export { ConnectionManager, connectionManager }