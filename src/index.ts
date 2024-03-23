import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import myHotelsRoutes from "./routes/my-hotels";
import hotelSearch from "./routes/hotels";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose
  .connect(process.env.DB_URL as string)
  .then(() => {})
  .catch(() => {
    process.exit(1);
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelsRoutes);
app.use("/api/hotels", hotelSearch);

app.listen(7000, () => {
  console.log("server is listening on localhost:7000");
});
