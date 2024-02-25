import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL as string).then(() => {
    console.log("Database connection established");
}).catch(() => {
    console.log("Error connecting to database");
    process.exit(1);  
})

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());


app.get("/api/test", async (req: Request, res: Response) => {
    res.json({message: "hello form test api endpoint!"})
})

app.listen(7000, () => {
    console.log("server is listening on localhost:7000")
})