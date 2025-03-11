import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select("-password -refreshToken");
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };