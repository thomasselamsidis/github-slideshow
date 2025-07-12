"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authenticate);
// GET /appointments?status=upcoming|past
router.get("/", async (req, res) => {
    try {
        const statusParam = req.query.status;
        let where = {};
        if (statusParam === "upcoming") {
            where.status = client_1.AppointmentStatus.UPCOMING;
        }
        else if (statusParam === "past") {
            where.status = { in: [client_1.AppointmentStatus.COMPLETED, client_1.AppointmentStatus.CANCELED] };
        }
        // Clients see their own, barbers see ones assigned, admins see all
        const role = req.user.role;
        if (role === client_1.UserRole.CLIENT) {
            where.clientId = req.user.id;
        }
        else if (role === client_1.UserRole.BARBER) {
            where.barberId = req.user.id;
        }
        const appointments = await prisma_1.prisma.appointment.findMany({
            where,
            include: {
                service: true,
                barber: { select: { name: true } },
                client: { select: { name: true } },
            },
            orderBy: { dateTime: "asc" },
        });
        res.json({ data: appointments });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
});
// POST /appointments
router.post("/", (0, roles_1.authorize)([client_1.UserRole.CLIENT]), async (req, res) => {
    try {
        const { serviceId, barberId, dateTime } = req.body;
        const appointment = await prisma_1.prisma.appointment.create({
            data: {
                clientId: req.user.id,
                barberId,
                serviceId,
                dateTime: new Date(dateTime),
                status: client_1.AppointmentStatus.UPCOMING,
            },
        });
        res.status(201).json({ data: appointment });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create appointment" });
    }
});
// PATCH /appointments/:id
router.patch("/:id", (0, roles_1.authorize)([client_1.UserRole.CLIENT]), async (req, res) => {
    try {
        const id = req.params.id;
        const { dateTime, status } = req.body;
        // allow updating only own appointment
        const appt = await prisma_1.prisma.appointment.findUnique({ where: { id } });
        if (!appt || appt.clientId !== req.user.id) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        const updated = await prisma_1.prisma.appointment.update({
            where: { id },
            data: {
                dateTime: dateTime ? new Date(dateTime) : undefined,
                status,
            },
        });
        res.json({ data: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update appointment" });
    }
});
exports.default = router;
