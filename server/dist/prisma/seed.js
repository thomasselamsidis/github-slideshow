"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Clear existing data (for idempotent local dev seeding)
    await prisma.rewardTransaction.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
    // Create users
    const admin = await prisma.user.create({
        data: {
            name: "Alice Admin",
            email: "admin@example.com",
            role: client_1.UserRole.ADMIN,
        },
    });
    const barberBob = await prisma.user.create({
        data: {
            name: "Bob Barber",
            email: "barber@example.com",
            role: client_1.UserRole.BARBER,
        },
    });
    const clientCharlie = await prisma.user.create({
        data: {
            name: "Charlie Client",
            email: "client@example.com",
            role: client_1.UserRole.CLIENT,
        },
    });
    // Services
    const haircut = await prisma.service.create({
        data: {
            title: "Haircut",
            duration: 30,
            price: 1500,
        },
    });
    const beardTrim = await prisma.service.create({
        data: {
            title: "Beard Trim",
            duration: 15,
            price: 800,
        },
    });
    // Future appointment for Charlie with Bob
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 2);
    await prisma.appointment.create({
        data: {
            clientId: clientCharlie.id,
            barberId: barberBob.id,
            serviceId: haircut.id,
            dateTime: upcomingDate,
            status: client_1.AppointmentStatus.UPCOMING,
        },
    });
    // Completed appointment in the past with reward
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const completedAppointment = await prisma.appointment.create({
        data: {
            clientId: clientCharlie.id,
            barberId: barberBob.id,
            serviceId: beardTrim.id,
            dateTime: pastDate,
            status: client_1.AppointmentStatus.COMPLETED,
        },
    });
    // Award points for completed appointment
    await prisma.rewardTransaction.create({
        data: {
            userId: clientCharlie.id,
            appointmentId: completedAppointment.id,
            pointsAwarded: 10,
        },
    });
    console.log(`Seed completed. Admin: ${admin.email}, Barber: ${barberBob.email}, Client: ${clientCharlie.email}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
