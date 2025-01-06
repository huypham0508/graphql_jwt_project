import { Event } from "src/app/types/system/Events";
import RedisRepository from "./redis_repository";
import { ConnectionType } from "../types/system/Connection";

class ConnectionManager {
    private connectionMap = new Map<string, ConnectionType>();
    private static instance: ConnectionManager;
    private redisRepository: RedisRepository;
    constructor() {
       this.redisRepository = RedisRepository.getInstance();
    }

    public static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    public appendConnection(queue_id: string, connection: ConnectionType) {
        this.connectionMap.set(queue_id, connection);
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
        this.redisRepository.setEvent(event);
    }

    public emitEventToConnections(): void {
        const connections = this.getAllConnections();
        connections.forEach(async connection => {
            const events = await this.redisRepository.getEvents(connection.queue_id, connection.last_event_id)
            if (events) {
                connection.res.status(200).json(events);
            }
            clearTimeout(connection.timeoutId);
            this.removeConnection(connection.queue_id)
        })
    }
}

export default ConnectionManager