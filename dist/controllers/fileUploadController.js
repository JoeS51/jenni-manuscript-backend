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
const promises_1 = __importDefault(require("fs/promises"));
dotenv_1.default.config();
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }
    const filePath = req.file.path;
    try {
        // Extract text using the unified utility function
        const extractedText = yield (0, fileTextExtraction_1.extractTextFromFile)(filePath);
        res.status(200).json({
            message: "File uploaded and text extracted successfully",
            file: req.file, // File metadata
            text: extractedText, // Extracted text
        });
        //remove file from storage when done
        yield promises_1.default.unlink(filePath);
        console.log(`File at ${filePath} has been deleted.`);
    }
    catch (err) {
        //remove file from temp storage
        yield promises_1.default.unlink(filePath);
        console.log(`File at ${filePath} has been deleted.`);
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
