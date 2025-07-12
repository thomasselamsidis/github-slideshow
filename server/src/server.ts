import express, { Response, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import appointmentsRouter from "./routes/appointments";
import servicesRouter from "./routes/services";
import usersRouter from "./routes/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => res.send("API is up"));

app.use("/appointments", appointmentsRouter);
app.use("/services", servicesRouter);
app.use("/users", usersRouter);

app.use((err: any, _req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));