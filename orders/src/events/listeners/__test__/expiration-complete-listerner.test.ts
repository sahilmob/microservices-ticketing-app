import mongoose from "mongoose";
import { OrderStatus } from "@smtickets1/common";

import { natsWrapper } from "../../../nats-wrapper";

import { ExpirationCompleteListener } from "../";
import { Order, Ticket } from "../../../models";

it("updates the order status, emit OrderCancelled event, and call ack", async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 10,
  });

  await ticket.save();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 1);

  const order = Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: expiration,
  });

  await order.save();

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const msg = {
    ack: jest.fn(),
  };

  // @ts-ignore
  await listener.onMessage({ orderId: order.id }, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});
