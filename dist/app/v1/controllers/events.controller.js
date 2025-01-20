"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doEvents = exports.handleEvents = exports.handleEventRegister = void 0;
const uuid_1 = require("uuid");
const redis_repository_1 = require("../../core/queue/redis_repository");
const connection_1 = require("../../core/queue/connection");
const handleEventRegister = async (req, res) => {
    try {
        const user = req.user;
        const userId = user === null || user === void 0 ? void 0 : user.id;
        if (!userId) {
            return res.status(400).json({ error: "user is required" });
        }
        const queue_id = (0, uuid_1.v4)() + "-" + Date.now();
        const sessionData = { user_id: userId, queue_id };
        await redis_repository_1.redisRepository.setSession(queue_id, sessionData);
        return res.status(200).json({
            success: true,
            message: "success",
            queue_id
        });
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "error" + error,
        });
    }
};
exports.handleEventRegister = handleEventRegister;
const handleEvents = async (req, res) => {
    var _a;
    try {
        const queue_id = req.query.queue_id;
        console.log(`Client disconnected: ${queue_id}`);
        if (typeof queue_id !== 'string') {
            return res.status(404).json({
                success: false,
                message: "queue_id must be a string",
            });
        }
        if (!(await connection_1.connectionManager.hasSession(queue_id))) {
            return res.status(404).json({
                success: false,
                message: "queue_id not found session",
            });
        }
        let last_event_id = req.query.last_event_id;
        last_event_id = last_event_id ? Number(last_event_id) : -1;
        const event = await connection_1.connectionManager.getEventsFromConnection(queue_id, last_event_id);
        if (event.length > 0) {
            return res.json({ success: true, data: event });
        }
        const timeoutId = setTimeout(() => {
            res.json({ success: true, data: [] });
            connection_1.connectionManager.removeConnection(queue_id);
        }, 30000);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        connection_1.connectionManager.appendConnection(queue_id, { timeoutId, res, queue_id, last_event_id, user_id: userId });
        req.on("close", () => {
            clearTimeout(timeoutId);
            connection_1.connectionManager.removeConnection(queue_id);
            console.log(`Client disconnected: ${queue_id}`);
        });
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "error" + error,
        });
    }
};
exports.handleEvents = handleEvents;
const doEvents = (data) => {
    const { eventData } = data;
    try {
        connection_1.connectionManager.doEvents(eventData);
    }
    catch (error) {
        console.error(`Error processing events for queue_id:`, error);
    }
};
exports.doEvents = doEvents;
//# sourceMappingURL=events.controller.js.map