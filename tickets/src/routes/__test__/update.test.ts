import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id doesn't exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signup())
    .send({
      title: "title",
      price: 10,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const response = await request(app).post("/api/tickets").send({
    title: "title",
    price: 10,
  });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({})
    .expect(401);
});

it("returns a 401 if the user doesn't own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "title",
      price: 10,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signup("567"))
    .send({
      title: "title",
      price: 10,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "title",
      price: 10,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signup())
    .send({ price: -1 })
    .expect(400);
});

it("updates the ticket provided valid input and publishes an event", async () => {
  const cookie = await global.signup();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: 10,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
