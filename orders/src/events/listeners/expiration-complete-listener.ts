import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  NotFoundError,
  OrderStatus,
  OrderCancelledEvent,
} from "@smtickets1/common";
import { Message } from "node-nats-streaming";

import { Order } from "../../models";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers";
import { queueGroupName } from "./";

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: orderId,
      ticket: { id: order.ticket.id },
      version: order.version,
    });

    msg.ack();
  }
}
