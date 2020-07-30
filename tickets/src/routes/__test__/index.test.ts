import request from "supertest";

import { app } from "../../app";

const createTicket = () => {
  const title = "concert";
  const price = 20;
  return request(app).post("/api/tickets").set("Cookie", global.signup()).send({
    title,
    price,
  });
};

it("returns the list of all tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get("/api/tickets").expect(200);

  expect(response.body.length).toBe(3);
});
