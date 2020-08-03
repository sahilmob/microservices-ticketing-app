import { Message } from "node-nats-streaming";
import { Listener, Subjects, TicketCreatedEvent } from "@smtickets1/common";
import mongoose from "mongoose";

import { Ticket } from "../../models";
import { queueGroupName } from "./";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    const newTicket = Ticket.build({
      id,
      title,
      price,
    });

    await newTicket.save();

    msg.ack();
  }
}
