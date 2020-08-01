import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined!");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined!");
  }

  try {
    await natsWrapper.connect("ticketing", "123", "http://nats-srv:4222");
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Database connected");
    app.listen(3000, () => console.log("Listening on port 3000!"));
  } catch (error) {
    console.error(error);
  }
};

start();
