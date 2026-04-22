import mongoose from 'mongoose';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Prescription from '../models/Prescription.js';
import Unavailability from '../models/Unavailability.js';
import Doctor from '../models/Doctor.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("CRITICAL: MONGODB_URI is not defined in .env");

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'hospitaladmin@liohns.com';
    const adminPassword = 'Admin@985';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        fullName: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Super Admin user created successfully');
    } else {
      console.log('Super Admin user already exists');
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
