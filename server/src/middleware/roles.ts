import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { UserRole } from "@prisma/client";

export function authorize(allowed: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}