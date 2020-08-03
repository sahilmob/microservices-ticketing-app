import request from "supertest";
import mongoose from "mongoose";
import { OrderStatus } from "@smtickets1/common";

import { app } from "../../app";
import { Ticket, Order } from "../../models";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket doesn't exist", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: new mongoose.Types.ObjectId(),
    })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const newTicket = Ticket.build({
    price: 10,
    title: "concert",
  });

  await newTicket.save();

  const expiry = new Date();
  expiry.setSeconds(expiry.getSeconds() + 15 * 60);

  const newOrder = Order.build({
    status: OrderStatus.Created,
    expiresAt: expiry,
    userId: "1234",
    ticket: newTicket,
  });

  await newOrder.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: newTicket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const newTicket = Ticket.build({
    price: 10,
    title: "concert",
  });

  await newTicket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: newTicket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
