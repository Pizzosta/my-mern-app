import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, username, email, password } = req.body;

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !phone || !username.trim() || !email.trim() || !password) {
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

    const sanitizedUsername = new RegExp(`^${username.trim()}$`, "i"); //( Try: username.trim().toLowerCase(); // Trim and convert to lowercase)

    // Phone validation
    let sanitizedPhone;
    let isValidPhone = true;

    // Convert to string and remove non-digits
    sanitizedPhone = String(phone).replace(/\D/g, "");

    // Add zero-padding if needed (optional safety)
    if (sanitizedPhone.length === 9) {
      sanitizedPhone = `0${sanitizedPhone}`;
    }

    // Validate length
    if (sanitizedPhone.length !== 10) {
      isValidPhone = false;
      console.error("Invalid phone number length:", phone);
    }

    if (!isValidPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits"
      });
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
    res.status(201).json({
      success: true,
      data: {
        user: userData,
        accessToken,
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
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }); // Find all users (empty object {} means no filter)

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "No users found", // Or perhaps just an empty array is fine
      });
    }

    res.status(200).json({
      success: true,
      data: users,
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

export const updateUser = async (req, res) => {

  const { id } = req.params;
  const updates = req.body; // Get the updates from the request body

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID"
    });
  }

  // Ensure updates.email and updates.username exist before trimming
  const sanitizedEmail = updates.email?.trim() ? new RegExp(`^${updates.email.trim()}$`, "i") : null; // Case-insensitive
  const sanitizedUsername = updates.username?.trim() ? new RegExp(`^${updates.username.trim()}$`, "i") : null;

  // Phone validation
  let sanitizedPhone;
  let isValidPhone = true;

  // Convert to string and remove non-digits
  const updatedPhone = updates.phone.trim();
  sanitizedPhone = updatedPhone.toString().replace(/\D/g, "");

  // Validate length
  if (sanitizedPhone.length !== 10) {
    isValidPhone = false;
    console.error("Invalid phone number length:", updates.phone);
  }

  if (!isValidPhone) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be 10 digits"
    });
  }

  // Conditional async checks for existing email, username, and phone
  const [existingEmail, existingUsername, existingPhone] = await Promise.all([
    sanitizedEmail ? User.findOne({ email: sanitizedEmail, _id: { $ne: id } }).catch(handleQueryError) : null,
    sanitizedUsername ? User.findOne({ username: sanitizedUsername, _id: { $ne: id } }).catch(handleQueryError) : null,
    (sanitizedPhone !== undefined) // Explicit check for presence 
      ? User.findOne({ phone: sanitizedPhone }).catch(handleQueryError) : null,
  ]);

  function handleQueryError(err) {
    console.error("Error during user check:", err);
    return null;
  }

  // Validate updates
  if (sanitizedEmail && existingEmail) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  if (sanitizedUsername && existingUsername) {
    return res.status(409).json({
      success: false,
      message: "User with this username already exists",
    });
  }
  if (sanitizedPhone && existingPhone) {
    return res.status(409).json({
      success: false,
      message: "User with this phone number already exists",
    });
  }

  // Remove _id and refreshToken from updates (important for security)
  delete updates._id;  // Prevent updating _id
  delete updates.refreshToken; // Prevent updating refreshToken

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates }, // Use $set to update only the provided fields
      { new: true, runValidators: true } // Return the updated user and run validators
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    // Handle MongoDB duplicate key
    if (error.code === 11000) {
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
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};