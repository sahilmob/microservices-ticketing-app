import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@smtickets1/common";

import { Ticket } from "../models/ticket";

const router = express.Router();

router.post(
  "/api/tickets",
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
    const { title, price } = req.body;
    const newTicket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await newTicket.save();
    return res.status(201).send(newTicket);
  }
);

export { router as newRouter };
