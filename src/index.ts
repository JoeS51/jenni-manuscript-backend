import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from "express";
import indexRouter from "./routes/index.js"
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Increased limit for large content
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));  // Match the limit

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: "Internal server error",
        details: err.message
    });
});

app.use("/", indexRouter);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});