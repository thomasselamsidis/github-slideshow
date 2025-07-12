"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const services_1 = __importDefault(require("./routes/services"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (_req, res) => res.send("API is up"));
app.use("/appointments", appointments_1.default);
app.use("/services", services_1.default);
app.use("/users", users_1.default);
app.use((err, _req, res) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
