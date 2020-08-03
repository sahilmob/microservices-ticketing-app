import request from "supertest";
import { OrderStatus } from "@smtickets1/common";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models";
import { natsWrapper } from "../../nats-wrapper";

const createTicket = async (price = 10, title = "concert") => {
  const newTicket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price,
    title,
  });

  await newTicket.save();

  return newTicket;
};

it("allows the user to delete his orders only", async () => {
  const userId1 = "5555555";
  const userId2 = "6666666";
  const cookie1 = await global.signup(userId1);
  const cookie2 = await global.signup(userId2);
  const ticket1 = await createTicket();
  const ticket2 = await createTicket();

  const {
    body: { id: order1Id },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1)
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);

  const {
    body: { id: order2Id },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order1Id}`)
    .set("Cookie", cookie2)
    .send({})
    .expect(401);

  const { body } = await request(app)
    .delete(`/api/orders/${order2Id}`)
    .set("Cookie", cookie2)
    .send({})
    .expect(200);

  expect(body.status).toBe(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
