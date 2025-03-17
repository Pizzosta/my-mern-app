const mongoose = require('mongoose');
const User = require('../models/user.model');

async function migrateAvatars() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({
    profilePicture: { $exists: false }
  });

  for (const user of users) {
    user.profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`;
    await user.save();
  }

  console.log(`Updated ${users.length} users`);
  process.exit();
}

migrateAvatars();