"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const firebase_1 = require("../firebase");
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }
        const idToken = header.split(" ")[1];
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(idToken);
        // Get or create user in local DB using decoded email
        const email = decoded.email;
        if (!email) {
            return res.status(401).json({ error: "Invalid token (no email)" });
        }
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Default role CLIENT when first sign-in
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    name: decoded.name ?? "",
                    role: client_1.UserRole.CLIENT,
                },
            });
        }
        req.user = { id: user.id, role: user.role };
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Unauthorized" });
    }
}
