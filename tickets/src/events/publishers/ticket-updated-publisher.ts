import { Publisher, Subjects, TicketUpdatedEvent } from "@smtickets1/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
