import { OrderCancelledEvent, OrderStatus } from "@smtickets1/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

import { OrderCancelledListener } from "../";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";

it("updates the ticket status with the correct orderId", async () => {
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    price: 10,
    title: "Test",
    userId: "12",
  });
  ticket.set({ orderId });

  await ticket.save();

  const listener = new OrderCancelledListener(natsWrapper.client);

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBe(undefined);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "Test",
    userId: "1233",
  });

  await ticket.save();

  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[1][1]
  );

  expect(eventData.orderId).toBe(undefined);
});
