"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const fileUploadController_1 = require("../controllers/fileUploadController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
//for file upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Files are stored as Buffer in memory
});
router.get('/', (req, res) => {
    res.send("hello");
});
router.post('/chat', chatController_1.createReply);
router.post("/upload", upload.single('file'), fileUploadController_1.uploadFile);
exports.default = router;
