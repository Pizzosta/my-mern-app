import User from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

// Define cookie options at module scope
// Updated cookie options for local development
const cookieOptions = {
  httpOnly: true,
  secure: false, // Disable secure in development (HTTP)
  sameSite: 'lax', // Less strict than 'strict'
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/*
    // Create secure cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      //sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    */

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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
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
          message:
            "All fields (firstName, lastName, phone, username, email, password) are required",
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

      const sanitizedEmail = new RegExp(`^${email.trim()}$`, "i"); // Case-insensitive

      const sanitizedUsername = new RegExp(`^${username.trim()}$`, "i"); // Trim and convert to lowercase

      // Phone validation
      let sanitizedPhone;
      let isValidPhone = true;

      if (phone) { // Check if phone exists before processing
        const updatedPhone = phone.toString().trim();
        sanitizedPhone = updatedPhone.replace(/\D/g, "") // Remove non-digit characters
          .slice(0, 10); // Ensure maximum 10 digits

        // Validate length
        if (sanitizedPhone.length !== 10) {
          isValidPhone = false;
          console.error("Invalid phone number length:", phone);
        }

        if (!isValidPhone) {
          return res.status(400).json({
            success: false,
            message: "Phone number must be 10 digits",
          });
        }
      }

      // Perform asynchronous validation checks in parallel for faster response
      const [existingEmail, existingUsername, existingPhone] = await Promise.all([
        User.findOne({ email: sanitizedEmail, }).catch(handleQueryError),
        User.findOne({ username: sanitizedUsername, }).catch(handleQueryError),
        User.findOne({ phone: sanitizedPhone }).catch(handleQueryError),
      ]);

      // Error handling for query errors 
      function handleQueryError(err) {
        console.error("Error during user check:", err);
        return null;
      }

      // Check for existing user with the same email
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Check for existing user with the same username
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "User with this username already exists",
        });
      }

      // Check for existing user with the same phone
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "User with this phone number already exists",
        });
      }
      // Create new user (password will be hashed by the pre-save hook)
      const newUser = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: sanitizedPhone,
        username: username.trim(),
        email: email.trim(),
        password,
        role: req.body.role || "user", // Default to "user" if not provided
        profilePicture: req.file ? `/uploads/${req.file.filename}` : undefined, // Add profile picture if uploaded
      });

      // Save user to the database
      await newUser.save();

      // Generate tokens
      const accessToken = newUser.generateAccessToken();
      const refreshToken = newUser.generateRefreshToken();

      // Update refreshToken and save in a single operation into the Database
      await User.findByIdAndUpdate(newUser._id, { refreshToken }, { new: true, runValidators: false });


      // Omit sensitive data from the response
      const userData = await User.findById(newUser._id).select("-password -refreshToken");

      // Send response with tokens and user data
      res.status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
          success: true,
          data: {
            user: userData,
          },
          message: "User registered successfully",
        });

    } catch (error) {
      // Handle MongoDB duplicate key error (race condition)
      if (error.code === 11000) {
        // Extract the field that caused the duplicate key error
        const duplicateKey = Object.keys(error.keyValue)[0];
        const duplicateValue = error.keyValue[duplicateKey];

        return res.status(409).json({
          success: false,
          message: `User with this ${duplicateKey} (${duplicateValue}) already exists`,
        });
      }
      // Send MongoDatabase validation error to client
      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error("Error during signup:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const usersData = await User.find({}).sort({ createdAt: -1 }); // Find all users (empty object {} means no filter)

    if (!usersData) {
      return res.status(404).json({
        success: false,
        message: "No users found", // Or perhaps just an empty array is fine
      });
    }

    res.status(200).json({
      success: true,
      data: { users: usersData }
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req, res) => {

  const { id } = req.params; // Get the user ID from the URL parameter

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Find user by email or username
    //refine the logic to find the user by email or username usnig Regex
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    }).select("+password +refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Wrong Password",
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send response
    res.status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        data: {
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role
          }
        },
        message: "Login successful"
      });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Ensure user is authenticated (from verifyJWT)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user data found",
      });
    }

    // Get user ID from the authenticated request (set by verifyJWT middleware)
    const userId = req.user?._id;

    // Clear refreshToken from the database (optional but recommended)
    if (mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } }, // Remove refreshToken field
        { new: true, runValidators: false }
      );
    } else {
      console.warn("Invalid user ID:", userId);
    }

    // Clear cookies from the client's browser
    res
      .status(200)
      .clearCookie("accessToken", { ...cookieOptions, maxAge: 0 })
      .clearCookie("refreshToken", { ...cookieOptions, maxAge: 0 })
      .json({
        success: true,
        data: null, // Consistent with other endpoints
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("Error during logout:", error); // Log full error for debugging
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Ensure user is authenticated (from verifyJWT)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user data found",
      });
    }

    const userData = await User.findById(req.user._id)
      .select("-password -refreshToken");

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data"
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .status(200)
      .json({
        success: true,
        data: { accessToken: newAccessToken },
        message: "Tokens refreshed",
      });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

/*
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
        const sanitizedPhone = updates.phone.toString().trim().replace(/\D/g, "").slice(0, 10);
        if (sanitizedPhone.length !== 10) {
          return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
        }
        updates.phone = sanitizedPhone;

        // Check for existing phone number (excluding current user)
        const existingPhone = await User.findOne({ phone: sanitizedPhone, _id: { $ne: id } });
        if (existingPhone) {
          return res.status(409).json({ success: false, message: "User with this phone number already exists" });
        }
      }

      // Check email and username if provided
      if (updates.email) {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(updates.email.trim())) {
          return res.status(400).json({
            success: false,
            message: "Please fill a valid email address",
          });
        }
        const sanitizedEmail = new RegExp(`^${updates.email.trim()}$`, "i");
        const existingEmail = await User.findOne({ email: sanitizedEmail, _id: { $ne: id } });
        if (existingEmail) {
          return res.status(409).json({ success: false, message: "User with this email already exists" });
        }
      }
      if (updates.username) {
        const sanitizedUsername = new RegExp(`^${updates.username.trim()}$`, "i");
        const existingUsername = await User.findOne({ username: sanitizedUsername, _id: { $ne: id } });
        if (existingUsername) {
          return res.status(409).json({ success: false, message: "User with this username already exists" });
        }
      }

      // Add profile picture if uploaded
      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`;
      }

      delete updates._id;
      delete updates.refreshToken;

      // Proceed with your update logic here
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
*/
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
        const sanitizedPhone = updates.phone.toString().trim().replace(/\D/g, "").slice(0, 10);
        if (sanitizedPhone.length !== 10) {
          return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
        }
        updates.phone = sanitizedPhone;
      }

      // Email validation
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (updates.email && !emailRegex.test(updates.email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please fill a valid email address",
        });
      }

      const sanitizedEmail = updates.email ? new RegExp(`^${updates.email.trim()}$`, "i") : null;
      const sanitizedUsername = updates.username ? new RegExp(`^${updates.username.trim()}$`, "i") : null;

      // Run all the queries in parallel using Promise.all
      // Conditional async checks for existing email, username, and phone
      const [existingEmail, existingUsername, existingPhone] = await Promise.all([
        sanitizedEmail
          ? User.findOne({ email: sanitizedEmail, _id: { $ne: id } }).catch((error) => handleQueryError(error, "email"))
          : null,
        sanitizedUsername
          ? User.findOne({ username: sanitizedUsername, _id: { $ne: id } }).catch((error) => handleQueryError(error, "username"))
          : null,
        updates.phone
          ? User.findOne({ phone: updates.phone, _id: { $ne: id } }).catch((error) => handleQueryError(error, "phone"))
          : null
      ]);

      function handleQueryError(error, queryType) {
        console.error(`Error during user check (${queryType}):`, error);
        return null;
      }

      // Check if any of the validations failed
      if (existingEmail) {
        return res.status(409).json({ success: false, message: "User with this email already exists" });
      }

      if (existingUsername) {
        return res.status(409).json({ success: false, message: "User with this username already exists" });
      }

      if (existingPhone) {
        return res.status(409).json({ success: false, message: "User with this phone number already exists" });
      }

      // Add profile picture if uploaded
      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`;
      }

      delete updates._id;
      delete updates.refreshToken;

      // Proceed with your update logic here
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
        const errorMessages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ success: false, message: errorMessages.join(", ") });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};