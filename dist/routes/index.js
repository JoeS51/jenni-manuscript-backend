"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send("hello");
});
router.post('/chat', chatController_1.createReply);
exports.default = router;
