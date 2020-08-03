import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@smtickets1/common";
import { body } from "express-validator";

import { Order, Ticket } from "../models";
import { natsWrapper } from "../nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers";

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("Ticket id must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new NotFoundError();

    const isReserved = await ticket.isReserved();

    if (isReserved) throw new BadRequestError("Ticket is already reserved");

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const newOrder = Order.build({
      status: OrderStatus.Created,
      expiresAt: expiration,
      userId: req.currentUser!.id,
      ticket,
    });

    await newOrder.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: newOrder.id,
      expiresAt: newOrder.expiresAt.toISOString(),
      status: newOrder.status,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      userId: req.currentUser!.id,
      version: newOrder.version,
    });

    return res.status(201).send(newOrder);
  }
);

export { router as newRouter };
