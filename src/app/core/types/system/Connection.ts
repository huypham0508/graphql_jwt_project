import { Response } from "express";

export interface ConnectionType {
    timeoutId: NodeJS.Timeout,
    res: Response,
    queue_id: string,
    last_event_id: number,
    user_id: string,
}