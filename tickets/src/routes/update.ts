import express, { Request, Response } from "express";
import {
  NotFoundError,
  requireAuth,
  validateRequest,
  NotAuthorized,
} from "@smtickets1/common";
import { body } from "express-validator";

import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("title is required"),
    body("price")
      .isFloat({
        gt: 0,
      })
      .withMessage("price must be greater than 0")
      .not()
      .isEmpty()
      .withMessage("price is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { params, currentUser, body } = req;

    const { id } = params;

    const ticket = await Ticket.findById(id);

    if (!ticket) throw new NotFoundError();

    if (ticket.userId !== currentUser!.id) throw new NotAuthorized();

    ticket.set({
      title: body.title,
      price: body.price,
    });

    const updatedTicket = await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    return res.send(updatedTicket);
  }
);

export { router as updateRouter };
