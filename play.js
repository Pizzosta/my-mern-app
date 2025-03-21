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
      const [existingEmail, existingUsername, existingPhone] = await Promise.all(
        sanitizedEmail
          ? User.findOne({ email: sanitizedEmail, _id: { $ne: id } }).catch((error) => handleQueryError(error, "email"))
          : null,
        sanitizedUsername
          ? User.findOne({ username: sanitizedUsername, _id: { $ne: id } }).catch((error) => handleQueryError(error, "username"))
          : null,
        updates.phone
          ? User.findOne({ phone: updates.phone, _id: { $ne: id } }).catch((error) => handleQueryError(error, "phone"))
          : null
      );

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