import User from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

// Define cookie options
const cookieOptions = {
  httpOnly: true,
  secure: false, // Disable secure in development (HTTP)
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Unique filename
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only JPEG and PNG images are allowed"));
};

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
}).single("profilePicture"); // Expect a single file with field name 'profilePicture'

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// ... (existing imports and cookieOptions remain unchanged)

export const createUser = async (req, res) => {
  // Wrap the logic in upload middleware
  upload(req, res, async (err) => {
    if (err) return handleMulterError(err, req, res);

    try {
      const { firstName, lastName, phone, username, email, password } = req.body;

      // Validate required fields
      if (!firstName?.trim() || !lastName?.trim() || !phone || !username?.trim() || !email.trim() || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields (firstName, lastName, phone, username, email, password) are required",
        });
      }

      // Password Validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      // Email validation
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please fill a valid email address",
        });
      }

      const sanitizedEmail = new RegExp(`^${email.trim()}$`, "i");
      const sanitizedUsername = new RegExp(`^${username.trim()}$`, "i");

      // Phone validation
      let sanitizedPhone;
      const updatedPhone = phone.toString().trim();
      sanitizedPhone = updatedPhone.replace(/\D/g, "").slice(0, 10);
      if (sanitizedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      // Check for existing users
      const [existingEmail, existingUsername, existingPhone] = await Promise.all([
        User.findOne({ email: sanitizedEmail }),
        User.findOne({ username: sanitizedUsername }),
        User.findOne({ phone: sanitizedPhone }),
      ]);

      if (existingEmail) {
        return res.status(409).json({ success: false, message: "User with this email already exists" });
      }
      if (existingUsername) {
        return res.status(409).json({ success: false, message: "User with this username already exists" });
      }
      if (existingPhone) {
        return res.status(409).json({ success: false, message: "User with this phone number already exists" });
      }

      // Create new user
      const newUser = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: sanitizedPhone,
        username: username.trim(),
        email: email.trim(),
        password,
        role: req.body.role || "user",
        profilePicture: req.file ? `/uploads/${req.file.filename}` : undefined, // Add profile picture if uploaded
      });

      await newUser.save();

      // Generate tokens
      const accessToken = newUser.generateAccessToken();
      const refreshToken = newUser.generateRefreshToken();

      await User.findByIdAndUpdate(newUser._id, { refreshToken }, { new: true, runValidators: false });

      const userData = await User.findById(newUser._id).select("-password -refreshToken");

      res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
          success: true,
          data: { user: userData },
          message: "User registered successfully",
        });
    } catch (error) {
      if (error.code === 11000) {
        const duplicateKey = Object.keys(error.keyValue)[0];
        return res.status(409).json({
          success: false,
          message: `User with this ${duplicateKey} (${error.keyValue[duplicateKey]}) already exists`,
        });
      }
      if (error.name === "ValidationError") {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error("Error during signup:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};

export const updateUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return handleMulterError(err, req, res);

    const { id } = req.params;
    const updates = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    try {
      // Handle phone validation if provided
      if (updates.phone) {
        const updatedPhone = updates.phone.toString().trim();
        const sanitizedPhone = updatedPhone.replace(/\D/g, "").slice(0, 10);
        if (sanitizedPhone.length !== 10) {
          return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
        }
        updates.phone = sanitizedPhone;
      }

      // Add profile picture to updates if uploaded
      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`;
      }

      // Remove sensitive fields
      delete updates._id;
      delete updates.refreshToken;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (error) {
      if (error.code === 11000) {
        const duplicateKey = Object.keys(error.keyValue)[0];
        return res.status(409).json({
          success: false,
          message: `User with this ${duplicateKey} (${error.keyValue[duplicateKey]}) already exists`,
        });
      }
      if (error.name === "ValidationError") {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};

// ... (other endpoints like getAllUsers, deleteUser, loginUser, etc. remain unchanged)