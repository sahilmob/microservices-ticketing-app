import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toBe(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).toBe(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({});
  expect(response.status).not.toBe(401);
});

it("returns an error if an invalid title provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({ title: "", price: 10 });
  expect(response.status).toBe(400);
});

it("returns an error is an invalid price is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({ title: "title", price: -10 });
  expect(response.status).toBe(400);
});

it("creates a ticket with valid input ", async () => {
  const tickets = await Ticket.find();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "title",
      price: 10,
    })
    .expect(201);

  const updateTickets = await Ticket.find();

  expect(updateTickets.length).toBe(tickets.length + 1);
});

it("publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "title",
      price: 10,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
