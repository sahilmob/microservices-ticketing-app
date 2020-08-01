import { Publisher, Subjects, TicketCreatedEvent } from "@smtickets1/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
