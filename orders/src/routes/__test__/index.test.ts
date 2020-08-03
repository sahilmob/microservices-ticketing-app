import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket, OrderDoc } from "../../models";

const createTicket = async (price = 10, title = "concert") => {
  const newTicket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price,
    title,
  });

  await newTicket.save();

  return newTicket;
};

it("returns user orders", async () => {
  const userId1 = "5555555";
  const userId2 = "6666666";
  const cookie1 = await global.signup(userId1);
  const cookie2 = await global.signup(userId2);
  const ticket1 = await createTicket();
  const ticket2 = await createTicket();
  const ticket3 = await createTicket();
  const ticket4 = await createTicket();

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1)
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1)
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({
      ticketId: ticket4.id,
    })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie2)
    .send({})
    .expect(200);

  expect(response.body.length).toBe(2);
  const areOrdersForTheSameUser = response.body.every(
    (order: OrderDoc) => order.userId === userId2
  );
  expect(areOrdersForTheSameUser).toBe(true);
});
