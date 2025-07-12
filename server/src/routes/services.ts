import { Router, Response, Request } from "express";
import { prisma } from "../prisma";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { authorize } from "../middleware/roles";
import { UserRole } from "@prisma/client";

const router = Router();
router.use(authenticate);

// GET /services
router.get("/", async (_req: Request, res: Response) => {
  const services = await prisma.service.findMany({ where: { active: true } });
  res.json({ data: services });
});

// POST /services
router.post("/", authorize([UserRole.ADMIN, UserRole.BARBER]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, duration, price } = req.body;
    const service = await prisma.service.create({ data: { title, duration, price } });
    res.status(201).json({ data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create service" });
  }
});

export default router;