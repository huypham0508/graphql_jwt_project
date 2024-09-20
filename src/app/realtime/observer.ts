import { EventEmitter } from "stream";
import Helper from "../utils/helper";

class Observer extends EventEmitter {
  constructor() {
    super();
  }

  notify(data: any) {
    this.emit("notify", data);
  }
}
class Listener {
  name: any;
  constructor(name: any) {
    this.name = name;
  }

  update(data: any) {
    console.log(`${this.name} received notification:`, data);
    Helper.sendNotification({
      content: "content",
      sender: "65c5c308744dc99071ede422",
      recipients: ["65c5bcfcd2637b63827b43b8"],
    });
  }
}

const chatObserver = new Observer();

const listenerRoom = new Listener("Room");
const listenerMessage = new Listener("Message");

chatObserver.on("notify", (data) => listenerRoom.update(data));
chatObserver.on("notify", (data) => listenerMessage.update(data));

export { chatObserver };
