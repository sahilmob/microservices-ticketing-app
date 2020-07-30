import express from "express";
import cookieSession from "cookie-session";
import "express-async-errors";
import { NotFoundError, errorHandler } from "@smtickets1/common";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.all("*", async (_req, _res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
