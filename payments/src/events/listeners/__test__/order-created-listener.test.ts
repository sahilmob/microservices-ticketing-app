import mongoose from "mongoose";
import { OrderStatus } from "@smtickets1/common";

import { OrderCreatedListener } from "..";
import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../nats-wrapper";

it("creates order and calls ack", async () => {
  const data = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 12,
    },
    status: OrderStatus.Created,
    expiresAt: "",
  };

  const msg = {
    ack: jest.fn(),
  };

  const listener = new OrderCreatedListener(natsWrapper.client);

  // @ts-ignore
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order).toBeTruthy();
  expect(order!.price).toBe(data.ticket.price);
  expect(msg.ack).toHaveBeenCalled();
});
