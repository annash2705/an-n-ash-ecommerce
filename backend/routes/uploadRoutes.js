const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "annash_ecommerce",
        allowedFormats: ["jpeg", "png", "jpg", "webp"],
    },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }
        res.json({
            url: req.file.path,
            public_id: req.file.filename,
        });
    } catch (error) {
        res.status(500).json({ message: "Image upload failed", error: error.message });
    }
});

module.exports = router;
