import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../firebase";
import { prisma } from "../prisma";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends Request<any, any, any, any> {
  user?: {
    id: string;
    role: UserRole;
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const idToken = header.split(" ")[1];
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    // Get or create user in local DB using decoded email
    const email = decoded.email;
    if (!email) {
      return res.status(401).json({ error: "Invalid token (no email)" });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Default role CLIENT when first sign-in
      user = await prisma.user.create({
        data: {
          email,
          name: decoded.name ?? "",
          role: UserRole.CLIENT,
        },
      });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}