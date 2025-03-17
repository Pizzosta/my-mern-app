import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true, // Trim whitespace
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: [
        {
          validator: function (v) {
            return /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      ],
      unique: true, // Ensure phone numbers are unique
      index: true, // Index phone numbers for faster queries  
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6, // Enforce a minimum password length
      select: false, // Prevent password from being included in query
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: function () {
        // Generate avatar URL using username
        const username = this.username || 'user';
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
      }
    }
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password verification method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// JWT token generation methods
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Avatar creation
userSchema.pre('save', function(next) {
  if (this.isModified('username') && this.profilePicture.includes('dicebear')) {
    // Regenerate avatar if username changes and using default avatar
    this.profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.username)}`;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;