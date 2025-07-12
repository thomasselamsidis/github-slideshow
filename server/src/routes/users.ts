import { Router, Response } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../prisma";

const router = Router();
router.use(authenticate);

// GET /users/me
router.get("/me", async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  res.json({ data: user });
});

export default router;