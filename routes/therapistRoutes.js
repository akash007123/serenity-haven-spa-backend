const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getTherapists,
  getTherapist,
  createTherapist,
  updateTherapist,
  deleteTherapist,
  toggleTherapistStatus,
  toggleFeatured,
} = require("../controllers/therapistController");

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, "..", "uploads", "profile-pics");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Therapist routes
router.get("/", getTherapists);
router.get("/:id", getTherapist);
router.post("/", upload.single("profilePic"), createTherapist);
router.put("/:id", upload.single("profilePic"), updateTherapist);
router.delete("/:id", deleteTherapist);
router.patch("/:id/toggle-status", toggleTherapistStatus);
router.patch("/:id/toggle-featured", toggleFeatured);

module.exports = router;
