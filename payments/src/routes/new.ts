import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorized,
  BadRequestError,
  OrderStatus,
} from "@smtickets1/common";
import { body } from "express-validator";

import { Order } from "../models/Order";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { orderId, token } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    if (order.userId !== currentUser!.id) throw new NotAuthorized();

    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Order cancelled");

    const response = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
