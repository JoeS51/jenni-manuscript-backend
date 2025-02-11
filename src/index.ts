import express from "express";
import dotenv from 'dotenv'
import indexRouter from "./routes/index.js"
import cors from 'cors';

dotenv.config()

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/", indexRouter);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`)
})