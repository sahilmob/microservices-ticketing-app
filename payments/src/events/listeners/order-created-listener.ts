import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@smtickets1/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

import { queueGroupName } from "./";
import { Order } from "../../models/Order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const existingOrder = await Order.findById(data.id);

    if (existingOrder) throw new Error("Order already exists");

    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      price: data.ticket.price,
      status: OrderStatus.Created,
      userId: data.userId,
      version: 0,
    });

    await order.save();

    msg.ack();
  }
}
