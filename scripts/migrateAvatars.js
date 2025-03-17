import mongoose from 'mongoose';
import User from '../backend/models/user.model.js';
import 'dotenv/config';

async function migrateAvatars() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Get all users regardless of validation
    const users = await User.find();
    console.log(`Found ${users.length} users to process`);

    // Bulk update operation bypassing validation
    const bulkOps = users.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${
              encodeURIComponent(user.username || 'user')
            }`
          }
        }
      }
    }));

    // Execute bulk write with validation bypass
    const result = await User.bulkWrite(bulkOps, {
      bypassDocumentValidation: true
    });

    console.log(`Migration complete! Updated ${result.modifiedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrateAvatars();