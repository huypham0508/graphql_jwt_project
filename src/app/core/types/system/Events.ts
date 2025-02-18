export interface Event {
  event: any;
  id?: number | any;
  recipients: any[] | "all";
  type: "message" | "conversation" | "post" | "user" | "typing";
  op: "add" | "remove" | "update";
}

export interface RedisSession {
  user_id: number;
  queue_id: string;
}
