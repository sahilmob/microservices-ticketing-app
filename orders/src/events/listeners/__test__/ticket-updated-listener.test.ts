import mongoose, { version } from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@smtickets1/common";

import { TicketUpdatedListener } from "../";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: "Test",
  });

  await ticket.save();

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    price: 18,
    version: ticket.version + 1,
    title: "new title",
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  return { listener, data, message, ticket };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, data, message, ticket } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toBe(data.title);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it("doesn't call ack if the event number is incorrect", async () => {
  const { listener, message, data } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, message);
  } catch (error) {}

  expect(message.ack).not.toHaveBeenCalled();
});
