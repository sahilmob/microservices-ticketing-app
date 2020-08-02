import {Publisher, OrderCreatedEvent, Subjects} from "@smtickets1/common"

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject= Subjects.OrderCreated
}