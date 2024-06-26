import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/verifyToken";
const router = express.Router();

router.post(
  "/register",
  [
    check("firstName", "First name is required").isString(),
    check("lastName", "Last name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 8 or more characters required").isLength({
      min: 8,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
      user = new User(req.body);
      await user.save();
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });

      return res.status(200).json({ message: "User Registered Successfully" });
    } catch (error) {
      console.log("Error in registering: " + error);
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({
      min: 8,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ message: "Invalid Credentials" });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 86400000,
        })
        .json({ message: "Login Successfully!", userId: user._id });
    } catch (error) {
      console.log("Error in login: " + error);
    }
  }
);

router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).json({ userId: req.userId });
});

router.get("/logout", (req: Request, res: Response) => {
  res
    .cookie("token", "", {
      expires: new Date(0),
    })
    .json({ message: "Logout Successfully" });
});

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
