import { Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { CustomRequest } from "../types/Context";
import { Event } from "../types/system/Events";
import RedisRepository from "../realtime/redis_repository";
import ConnectionManager from "../realtime/connection.service";

const redisRepository = RedisRepository.getInstance();
const connectionManager = ConnectionManager.getInstance();


export const handleEventRegister = async(req: CustomRequest, res: Response): Promise<Response> => {
  try {
    const user = req.user;
    const userId = user?.id;
    if (!userId) {
      return res.status(400).json({ error: "user is required" });
    }
    // const sessionId = `${userId}-${Date.now()}`;
    const queue_id = uuidv4() + "-" + Date.now();
    const sessionData = { userId, queue_id };
    await redisRepository.setSession(queue_id, sessionData)

    return res.status(200).json({
        success: true,
        message: "success",
        queue_id
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "error" + error,
    });
  }
};

export const handleEvents = async(req: CustomRequest, res: Response): Promise<void | Response> => {
  try {
    const queue_id = req.query.queue_id;
    if (typeof queue_id !== 'string') {
      return res.status(403).json({
        success: false,
        message: "queue_id must be a string",
      });
    }
    let last_event_id: number | any = req.query.last_event_id;
    last_event_id = last_event_id ? Number(last_event_id) : -1

    const event = await redisRepository.getEvents(queue_id, last_event_id)
    if (event && event.length > 0) {
      return res.json({success: true, data: event});
    }
    const timeoutId = setTimeout(() => {
      res.json({ event: null });
      connectionManager.removeConnection(queue_id);
    }, 30000);

    connectionManager.appendConnection(queue_id, { timeoutId, res, queue_id, last_event_id });

    req.on("close", () => {
      clearTimeout(timeoutId);
      connectionManager.removeConnection(queue_id);
      console.log(`Client disconnected: ${queue_id}`);
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "error" + error,
    });
  }
};

export const doEvents = async (eventData: Event): Promise<void> => {
  try {
    await redisRepository.setEvent(eventData).then(
      () => connectionManager.emitEventToConnections()
    );
  } catch (error) {
    console.error(`Error processing events for queue_id:`, error);
  }
};
