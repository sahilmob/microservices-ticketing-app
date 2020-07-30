import express, { Request, Response } from "express";
import { NotFoundError } from "@smtickets1/common";

import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const { params } = req;
  const { id } = params;

  const ticket = await Ticket.findById(id);

  if (!ticket) throw new NotFoundError();

  return res.send(ticket);
});

export { router as showRouter };
