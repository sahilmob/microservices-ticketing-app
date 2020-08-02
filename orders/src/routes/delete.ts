import express, { Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorized,
  OrderStatus,
} from "@smtickets1/common";
import { Order } from "../models";

const router = express.Router();

router.delete(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser, params } = req;
    const { id } = params;

    const order = await Order.findById(id).populate("ticket");

    if (!order) throw new NotFoundError();

    if (order.userId !== currentUser!.id) throw new NotAuthorized();

    order.status = OrderStatus.Cancelled;

    await order.save();

    res.send(order);
  }
);

export { router as deleteRouter };
