import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@smtickets1/common";

import { TicketCreatedListener } from "../";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models";

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Test",
    price: 10,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  return { listener, data, message };
};

it("create and save a ticket", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toBe(data.title);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
