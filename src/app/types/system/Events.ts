export interface Event {
    event: any,
    id?: number | any,
    recipients: any[]  | "all"
    type: 'message' | 'updated' | 'post',
}

export interface RedisSession {
    user_id: number,
    queue_id: string,
}