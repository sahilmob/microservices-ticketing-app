import {Publisher, OrderCancelledEvent, Subjects} from "@smtickets1/common"

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject= Subjects.OrderCancelled
}