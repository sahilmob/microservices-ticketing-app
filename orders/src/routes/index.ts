import express, { Request, Response } from "express";
import { requireAuth } from "@smtickets1/common";

import { Order } from "../models";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const { currentUser } = req;

  const userOrders = await Order.find({
    userId: currentUser!.id,
  }).populate("ticket");

  res.send(userOrders);
});

export { router as indexRouter };
