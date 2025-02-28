import { Router, Request, Response } from 'express';
import { createReply, scrapeWebpage } from '../controllers/chatController';
import { uploadFile } from '../controllers/fileUploadController';
import multer from "multer";

const router = Router();
//for file upload
const upload = multer();

router.get('/', (req, res) => {
    res.send("hello")
});


router.post('/chat', createReply);
router.post('/scrape', upload.none(), scrapeWebpage);


router.post("/upload", upload.single('file'), uploadFile);


export default router;