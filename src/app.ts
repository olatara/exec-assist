import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
// app.use(passport.session());

import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import calendarRoutes from "./routes/calendar";
import meetingRoutes from "./routes/meeting";
import chatRoutes from "./routes/chat";

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/calendar", calendarRoutes);
app.use("/meeting", meetingRoutes);
app.use("/chat", chatRoutes);

app.get("/", (_req, res) => {
  res.send("Executive Assistant API");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
