import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "concert";
  const price = 20;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title,
      price,
    });

  const {
    body: { id },
  } = response;
  const showResponse = await request(app).get(`/api/tickets/${id}`).expect(200);
  const { body } = showResponse;

  expect(body.title).toBe(title);
  expect(body.price).toBe(price);
});
