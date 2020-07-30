import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined!");
  }

  try {
    await mongoose.connect("mongodb://tickets-mongo-srv:27017/tickets", {
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
