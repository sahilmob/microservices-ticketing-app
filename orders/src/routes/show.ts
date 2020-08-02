import express, { Request, Response } from "express";
import { requireAuth, NotFoundError, NotAuthorized } from "@smtickets1/common";
import { Order } from "../models";

const router = express.Router();

router.get(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser, params } = req;
    const { id } = params;

    const order = await Order.findById(id).populate("ticket");

    if (!order) throw new NotFoundError();

    if (order.userId !== currentUser!.id) throw new NotAuthorized();

    res.send(order);
  }
);

export { router as showRouter };
