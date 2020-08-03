import { OrderCreatedEvent, OrderStatus } from "@smtickets1/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

import { OrderCreatedListener } from "../";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { json } from "express";

it("updates the ticket status with the correct orderId", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "Test",
    userId: "12",
  });

  await ticket.save();

  expect(ticket.orderId).toBeUndefined();

  const listener = new OrderCreatedListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();

  const expiry = new Date();
  expiry.setSeconds(expiry.getSeconds() + 15 * 60);

  const data: OrderCreatedEvent["data"] = {
    id: orderId,
    userId: "1234",
    status: OrderStatus.Created,
    expiresAt: expiry.toString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: 12,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBe(orderId);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "Test",
    userId: "1233",
  });

  await ticket.save();

  const listener = new OrderCreatedListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();

  const expiry = new Date();
  expiry.setSeconds(expiry.getSeconds() + 15 * 60);

  const data: OrderCreatedEvent["data"] = {
    id: orderId,
    userId: "123334",
    status: OrderStatus.Created,
    expiresAt: expiry.toString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: 12,
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

  expect(eventData.orderId).toBe(data.id);
});
