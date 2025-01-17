"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const fileTextExtraction_1 = require("../utils/fileTextExtraction");
const dotenv_1 = __importDefault(require("dotenv"));
const sendEmail_1 = require("../utils/sendEmail");
dotenv_1.default.config();
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }
    try {
        // Extract text from the file buffer directly
        const fileBuffer = req.file.buffer; // File is in memory
        const fileExtension = req.file.originalname.split(".").pop(); // Get file extension
        const extractedText = yield (0, fileTextExtraction_1.extractTextFromFile)(fileBuffer, `.${fileExtension}`);
        const email = "joesluis51@gmail.com";
        const subject = "test ai manuscript";
        const text = "Hello this is a test email";
        yield (0, sendEmail_1.sendEmail)(email, subject, text);
        res.status(200).json({
            message: "File uploaded and text extracted successfully",
            file: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
            text: extractedText, // Extracted text
        });
    }
    catch (err) {
        // Narrowing 'err' to Error
        if (err instanceof Error) {
            console.error("Error extracting text:", err.message);
            res.status(500).json({
                message: "Error extracting text from file",
                error: err.message,
            });
        }
        else {
            console.error("Unknown error:", err);
            res.status(500).json({
                message: "An unknown error occurred",
                error: String(err),
            });
        }
    }
});
exports.uploadFile = uploadFile;
