import mongoose from "mongoose";
import { OrderStatus } from "@smtickets1/common";

import { OrderCancelledListener } from "..";
import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../nats-wrapper";

it("updates the order status to cancelled  and calls ack", async () => {
  const newOrder = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 12,
    status: OrderStatus.Created,
  });

  await newOrder.save();

  const msg = {
    ack: jest.fn(),
  };

  const listener = new OrderCancelledListener(natsWrapper.client);

  // @ts-ignore
  await listener.onMessage(
    {
      id: newOrder.id,
      version: newOrder.version + 1,
      ticket: {
        id: mongoose.Types.ObjectId().toHexString(),
      },
    },
    // @ts-ignore
    msg
  );

  const order = await Order.findById(newOrder.id);

  expect(order!.status).toBe(OrderStatus.Cancelled);
  expect(msg.ack).toHaveBeenCalled();
});
