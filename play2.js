
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

try {
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
