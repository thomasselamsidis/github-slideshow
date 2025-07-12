import { Router, Response } from "express";
import { prisma } from "../prisma";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { authorize } from "../middleware/roles";
import { AppointmentStatus, UserRole } from "@prisma/client";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// GET /appointments?status=upcoming|past
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const statusParam = req.query.status as string | undefined;
    let where: any = {};

    if (statusParam === "upcoming") {
      where.status = AppointmentStatus.UPCOMING;
    } else if (statusParam === "past") {
      where.status = { in: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED] };
    }

    // Clients see their own, barbers see ones assigned, admins see all
    const role = req.user!.role;
    if (role === UserRole.CLIENT) {
      where.clientId = req.user!.id;
    } else if (role === UserRole.BARBER) {
      where.barberId = req.user!.id;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        barber: { select: { name: true } },
        client: { select: { name: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    res.json({ data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// POST /appointments
router.post("/", authorize([UserRole.CLIENT]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId, barberId, dateTime } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        clientId: req.user!.id,
        barberId,
        serviceId,
        dateTime: new Date(dateTime),
        status: AppointmentStatus.UPCOMING,
      },
    });
    res.status(201).json({ data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// PATCH /appointments/:id
router.patch(
  "/:id",
  authorize([UserRole.CLIENT]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id;
      const { dateTime, status } = req.body;

      // allow updating only own appointment
      const appt = await prisma.appointment.findUnique({ where: { id } });
      if (!appt || appt.clientId !== req.user!.id) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          dateTime: dateTime ? new Date(dateTime) : undefined,
          status,
        },
      });
      res.json({ data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update appointment" });
    }
  },
);

export default router;