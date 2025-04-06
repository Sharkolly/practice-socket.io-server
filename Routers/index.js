const express = require("express");
const upload = require("../middleware/multer");
const { signUp, postContent, Login, Email } = require("../Controllers");
const verifyToken = require("../middleware");
const router = express.Router();

router.post("/signup", upload.single("profilePic"), signUp);

router.post("/login", Login);
router.get('/emails', Email)
router.post("/post-content", verifyToken, postContent);

module.exports = { router };