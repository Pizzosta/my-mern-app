export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. ID Validation (same pattern as createUser's ID check)
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // 2. Initialize sanitized values
    const sanitized = {
      email: updates.email?.trim(),
      username: updates.username?.trim(),
      phone: updates.phone?.toString().replace(/\D/g, "") // Same digit cleaning as createUser
    };

    // 3. Email Validation (identical to createUser)
    if (updates.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(sanitized.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format"
      });
    }

    // 4. Phone Validation (identical to createUser)
    if (updates.phone && sanitized.phone?.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits"
      });
    }

    // 5. Duplicate Checks (same logic as createUser with ID exclusion)
    const [existingEmail, existingUsername, existingPhone] = await Promise.all([
      updates.email ? User.findOne({
        email: new RegExp(`^${sanitized.email}$`, "i"),
        _id: { $ne: id }
      }) : null,

      updates.username ? User.findOne({
        username: new RegExp(`^${sanitized.username}$`, "i"),
        _id: { $ne: id }
      }) : null,

      updates.phone ? User.findOne({
        phone: sanitized.phone,
        _id: { $ne: id }
      }) : null
    ]);

    // 6. Conflict Responses (same as createUser)
    if (existingEmail) return conflict(res, "email");
    if (existingUsername) return conflict(res, "username");
    if (existingPhone) return conflict(res, "phone number");

    // 7. Prepare final updates (same security as createUser)
    const finalUpdates = {
      ...updates,
      ...(updates.email && { email: sanitized.email }),
      ...(updates.username && { username: sanitized.username }),
      ...(updates.phone && { phone: sanitized.phone })
    };
    delete finalUpdates._id;
    delete finalUpdates.refreshToken;

    // 8. Database update (same error handling as createUser)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: finalUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return notFound(res);

    // 9. Response formatting (same as createUser)
    const userData = updatedUser.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    // 10. Error handling (identical to createUser)
    if (error.code === 11000) {
      const key = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${key} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reused helper functions
const conflict = (res, field) => res.status(409).json({
  success: false,
  message: `User with this ${field} already exists`
});

const notFound = (res) => res.status(404).json({
  success: false,
  message: "User not found"
});