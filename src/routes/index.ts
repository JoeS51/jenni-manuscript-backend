import { Router, Request, Response } from 'express';
import { createReply } from '../controllers/chatController';
import { uploadFile } from '../controllers/fileUploadController';
import multer from "multer";

const router = Router();
//for file upload
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/"); // Save files to the 'uploads/' directory
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname); // Use the original file name
        },
    }),
});

router.get('/', (req, res) => {
    res.send("hello")
});


router.post('/chat', createReply)


router.post("/upload", upload.single('file'), uploadFile);


export default router;