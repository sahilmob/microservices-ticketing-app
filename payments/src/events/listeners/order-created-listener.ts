import { Listener, OrderCreatedEvent, Subjects } from "@smtickets1/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./";
import { Order } from "../../models/Order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const existingOrder = await Order.findById(data.id);

    if (existingOrder) throw new Error("Order already exists");

    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
