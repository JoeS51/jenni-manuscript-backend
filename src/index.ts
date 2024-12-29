import express from "express";
import dotenv from 'dotenv'
import indexRouter from "./routes/index.js"

dotenv.config()

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json())

app.use("/", indexRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})