import express from "express";

import { currentUSer } from "@smtickets1/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUSer, (req, res) => {
  return res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
