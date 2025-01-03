// import axios from "axios";

// interface QueueResponse {
//   queue_id: string;
//   last_event_id: number;
// }

// export class ServerEvents {
//   private static instance: ServerEvents | null = null;
//   private queueId: string | null = null;
//   private lastEventId: number | null = null;
//   private isRunning: boolean = false;
//   private isWaitingInitialFetch: boolean = true;
//   private eventsWhileLoading: any[] = [];
//   private getEventsFailures: number = 0;
//   private readonly baseUrl: string = "http://localhost:9991/api/v1";
//   private readonly username: string = "events-bot@zulipdev.com";
//   private readonly password: string = "DN2HycXtTYvC8DoPhbCYhDyW8TJn6LJ4";

//   private constructor() {}

//   public static getInstance(): ServerEvents {
//     if (!ServerEvents.instance) {
//       ServerEvents.instance = new ServerEvents();
//     }
//     return ServerEvents.instance;
//   }

//   public async initialize(): Promise<void> {
//     if (this.isRunning) {
//       console.log("ServerEvents is already running.");
//       return;
//     }

//     console.log("Initializing server events...");
//     this.isRunning = true;
//     if (this.queueId == null) {
//       const registerQueue = await this.registerQueue();
//       if (registerQueue) {
//         this.queueId = registerQueue.queue_id;
//         this.lastEventId = registerQueue.last_event_id;
//       }
//     }
//     console.log("Registered events", this.queueId, this.lastEventId);
//     await this.getEvents();
//   }

//   public stop(): void {
//     console.log("Registered events", this.queueId, this.lastEventId);
//     if (!this.isRunning) {
//       console.log("ServerEvents is not running.");
//       return;
//     }

//     this.isRunning = false;
//     console.log("ServerEvents has been stopped.");
//   }

//   private async registerQueue(): Promise<QueueResponse | null> {
//     const url = `${this.baseUrl}/register`;
//     try {
//       const response = await axios.post<QueueResponse>(url, {}, {
//         auth: {
//           username: this.username,
//           password: this.password,
//         },
//       });
//       if (response.status === 200) {
//         return response.data;
//       }
//     } catch (error: any) {
//       console.error("Error registering queue:", error.message);
//     }
//     return null;
//   }

//   private async getEvents(): Promise<void> {
//     if (this.queueId === null) {
//       this.initialize();
//     }

//     if (!this.isRunning) {
//       console.log("Stopping event polling as ServerEvents is no longer running.");
//       return;
//     }

//     if (!this.queueId || this.lastEventId === null) {
//       console.error("Queue ID or lastEventId not set. Cannot fetch events.");
//       return;
//     }

//     const url = `${this.baseUrl}/events?queue_id=${encodeURIComponent(this.queueId)}&last_event_id=${this.lastEventId}`;

//     try {
//       const response = await axios.get<{ events: any[] }>(url, {
//         auth: { username: this.username, password: this.password },
//       });
//       if (response.status === 200 && response.data.events) {
//         console.log({response: response.data.events});
//         this.handleEvents(response.data.events);
//         this.getEventsFailures = 0; // Reset failure count on success
//         if (this.isRunning) {
//           await this.getEvents(); // Recursive call for long polling
//         }
//       } else {
//         console.error("Unexpected response from server:", response.data);
//         await this.retryGetEvents();
//       }
//     } catch (error: any) {
//       console.error("Error fetching events:", error.message);
//       this.getEventsFailures++;
//       await this.retryGetEvents();
//     }
//   }

//   private async retryGetEvents(): Promise<void> {
//     const backoffScale = Math.min(2 ** this.getEventsFailures, 90);
//     const backoffDelay = ((1 + Math.random()) / 2) * backoffScale * 1000;

//     console.log(`Retrying in ${Math.round(backoffDelay / 1000)} seconds...`);
//     await this.sleep(backoffDelay);

//     if (this.isRunning) {
//       await this.getEvents();
//     }
//   }

//   private handleEvents(events: any[]): void {
//     for (const event of events) {
//       if (!this.isRunning) break;

//       this.dispatchEvent(event);
//     }

//     if (this.isWaitingInitialFetch) {
//       console.log("Processing events stored during initial fetch...");
//       for (const event of this.eventsWhileLoading) {
//         this.dispatchEvent(event);
//       }
//       this.eventsWhileLoading = [];
//       this.isWaitingInitialFetch = false;
//     }
//   }

//   private dispatchEvent(event: any): void {
//     try {
//       this.lastEventId = Math.max(this.lastEventId!, event.id);

//       switch (event.type) {
//         case "message":
//           console.log("New message event:", event);
//           break;
//         case "user_group":
//           console.log("User group update event:", event);
//           break;
//         case "realm":
//           console.log("Realm update event:", event);
//           break;
//         default:
//           console.log("Unhandled event type:", event.type, event);
//       }
//     } catch (error) {
//       console.error("Failed to process event:", event, error);
//     }
//   }

//   private sleep(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }
// }

// export default ServerEvents;