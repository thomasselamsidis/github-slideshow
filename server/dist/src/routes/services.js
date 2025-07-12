"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /services
router.get("/", async (_req, res) => {
    const services = await prisma_1.prisma.service.findMany({ where: { active: true } });
    res.json({ data: services });
});
// POST /services
router.post("/", (0, roles_1.authorize)([client_1.UserRole.ADMIN, client_1.UserRole.BARBER]), async (req, res) => {
    try {
        const { title, duration, price } = req.body;
        const service = await prisma_1.prisma.service.create({ data: { title, duration, price } });
        res.status(201).json({ data: service });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create service" });
    }
});
exports.default = router;
