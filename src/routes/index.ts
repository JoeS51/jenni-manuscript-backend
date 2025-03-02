import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/fileUploadController";
import { scrapeWebpage } from "../controllers/chatController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// File upload route
router.post("/upload", upload.single("file"), uploadFile);

// Journal scraping route
router.post("/scrape", scrapeWebpage);

export default router;