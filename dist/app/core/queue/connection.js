"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionManager = exports.ConnectionManager = void 0;
const redis_repository_1 = require("./redis_repository");
class ConnectionManager {
    constructor() {
        this.connectionMap = new Map();
        this.redisRepository = redis_repository_1.redisRepository;
    }
    async hasSession(key) {
        return await this.redisRepository.getSession(key) !== null;
    }
    appendConnection(queue_id, connection) {
        this.connectionMap.set(queue_id, connection);
        this.redisRepository.resetTimeSession(queue_id);
    }
    removeConnection(queue_id) {
        this.connectionMap.delete(queue_id);
    }
    getConnection(queue_id) {
        return this.connectionMap.get(queue_id);
    }
    getAllConnections() {
        return Array.from(this.connectionMap.values());
    }
    addEventToConnections(event) {
        this.redisRepository.setEvents(event);
    }
    getEventsFromConnection(key, last_event_id) {
        return this.redisRepository.getEvents(key, last_event_id);
    }
    async emitEventToConnections(recipients) {
        const connections = this.getAllConnections().filter(connection => recipients === "all" || (Array.isArray(recipients) && recipients.includes(connection.user_id)));
        await Promise.all(connections.map(async (connection) => {
            const events = await this.redisRepository.getEvents(connection.queue_id, connection.last_event_id);
            if (events.length) {
                connection.res.status(200).json({ success: true, data: events });
                clearTimeout(connection.timeoutId);
                this.removeConnection(connection.queue_id);
            }
        }));
    }
    async doEvents(eventData) {
        await this.redisRepository.setEvents(eventData);
        await this.emitEventToConnections(eventData.recipients);
    }
}
exports.ConnectionManager = ConnectionManager;
const connectionManager = new ConnectionManager();
exports.connectionManager = connectionManager;
//# sourceMappingURL=connection.js.map