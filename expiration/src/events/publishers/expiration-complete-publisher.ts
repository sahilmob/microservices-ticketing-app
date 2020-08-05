import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@smtickets1/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
