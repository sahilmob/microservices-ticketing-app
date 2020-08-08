import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  OrderStatus,
} from "@smtickets1/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./";
import { Order } from "../../models/Order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const existingOrder = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!existingOrder) throw new Error("Order doesn't exists");

    existingOrder.set({
      status: OrderStatus.Cancelled,
    });
    await existingOrder.save();

    msg.ack();
  }
}
