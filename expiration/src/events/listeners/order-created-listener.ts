import { Listener, OrderCreatedEvent, Subjects } from "@smtickets1/common";
import { Message } from "node-nats-streaming";
import {} from "bull";

import { queueGroupName } from "./";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {}
}
