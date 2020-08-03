import { Message } from "node-nats-streaming";
import { Listener, Subjects, TicketUpdatedEvent } from "@smtickets1/common";

import { Ticket } from "../../models";
import { queueGroupName } from "./";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, title, price, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) throw new Error("Ticket not found");

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
