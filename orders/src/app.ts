import express from "express";
import cookieSession from "cookie-session";
import "express-async-errors";
import { NotFoundError, errorHandler, currentUser } from "@smtickets1/common";

import { indexRouter } from "./routes/index";
import { newRouter } from "./routes/new";
import { showRouter } from "./routes/show";
import { deleteRouter } from "./routes/delete";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);
app.use(indexRouter);
app.use(newRouter);
app.use(showRouter);
app.use(deleteRouter);

app.all("*", async (_req, _res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
