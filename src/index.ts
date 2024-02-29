import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import cookieParser from "cookie-parser";

mongoose
  .connect(process.env.DB_URL as string)
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.log("Error connecting to database");
    console.log(error);
    process.exit(1);
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/users", userRoutes);

app.listen(7000, () => {
  console.log("server is listening on localhost:7000");
});
