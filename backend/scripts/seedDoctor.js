import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

dotenv.config({ path: 'backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("CRITICAL: MONGODB_URI is not defined in .env");

const doctorsData = [
  {
    fullName: "Navin Patel",
    email: "meetsavani278@gmail.com",
    password: "Navin@123",
    role: "doctor",
    specialization: "Consulting ENT Surgeon",
    experience: 25,
    bio: "Experienced ENT surgeon specializing in the diagnosis and treatment of ear, nose, and throat disorders. Skilled in advanced surgical procedures, sinus treatments, and voice-related conditions, with a strong focus on patient comfort and recovery.",
    profileImage: "/images/Navin_Patel.png",
    consultationFee: 3000
  },
  {
    fullName: "Heer Patel",
    email: "tempuseuse21@gmail.com",
    password: "Heer@123",
    role: "doctor",
    specialization: "MS (ENT), FOIOSAS",
    experience: 12,
    bio: "ENT specialist with expertise in endoscopic sinus surgery and advanced otolaryngology procedures. Dedicated to providing precise, minimally invasive treatments for nasal, throat, and ear conditions with a patient-first approach.",
    profileImage: "/images/Heer_Patel.png",
    consultationFee: 2500
  },
  {
    fullName: "Abhijit Makwana",
    email: "meetsavani40@gmail.com",
    password: "Abhijit@123",
    role: "doctor",
    specialization: "Head & Neck Cancer Surgeon",
    experience: 5,
    bio: "Highly skilled head and neck cancer surgeon specializing in tumor removal, reconstructive surgery, and comprehensive cancer care. Committed to early diagnosis, effective treatment planning, and improving patient outcomes.",
    profileImage: "/images/Abhijit_Makwana.png",
    consultationFee: 4000
  },
  {
    fullName: "Yama Patel",
    email: "vishwamodi2406@gmail.com",
    password: "Yama@123",
    role: "doctor",
    specialization: "Oral & Maxillofacial Surgeon",
    experience: 3,
    bio: "Oral and maxillofacial surgeon specializing in facial trauma, jaw correction, dental implants, and complex oral surgeries. Focused on restoring function and aesthetics with precision and compassionate care.",
    profileImage: "/images/Yama_Patel.png",
    consultationFee: 2200
  }, 
  {
  fullName: "Kanak Mittal Patel",
  email: "allmotoedge@gmail.com",
  password: "Kanak@123",
  role: "doctor",
  specialization: "ENT Consultant",
  experience: 8,
  bio: "ENT consultant experienced in managing a wide range of ear, nose, and throat conditions including allergies, infections, and voice disorders. Known for a patient-centric approach and effective non-surgical and surgical treatments.",
  profileImage: "/images/Kanak_Patel.png",
  consultationFee: 2400
},
{
  fullName: "Mit Patel",
  email: "omjasoliyatab@gmail.com",
  password: "Mit@123",
  role: "doctor",
  specialization: "Opthalmology Surgeon",
  experience: 6,
  bio: "Ophthalmology surgeon specializing in eye surgeries including cataract, glaucoma, and retinal conditions. Dedicated to preserving and enhancing vision using advanced surgical techniques and personalized care.",
  profileImage: "/images/Mit_Patel.png",
  consultationFee: 3500
},
{
  fullName: "Kushal Shah",
  email: "radheworks21@gmail.com",
  password: "Kushal@123",
  role: "doctor",
  specialization: "Neurology Surgeon",
  experience: 2,
  bio: "Neurology surgeon specializing in brain and spine disorders, including stroke management and neurosurgical procedures. Focused on delivering precise surgical care and improving neurological health outcomes.",
  profileImage: "/images/Kushal_Shah.png",
  consultationFee: 3800
}
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const BASE_URL = process.env.BASE_URL;
    if (!BASE_URL) throw new Error("CRITICAL: BASE_URL is not defined in .env");

    for (const doc of doctorsData) {
      const fullImageUrl = doc.profileImage.startsWith('http') ? doc.profileImage : `${BASE_URL}${doc.profileImage}`;

      // Check if user already exists
      let user = await User.findOne({ email: doc.email });

      if (!user) {
        user = new User({
          fullName: doc.fullName,
          email: doc.email,
          password: doc.password, // Schema pre-save hook will hash this
          role: 'doctor',
          avatarUrl: fullImageUrl
        });
        await user.save();
        console.log(`Created user for ${doc.fullName}`);
      } else {
        user.avatarUrl = fullImageUrl;
        await user.save();
        console.log(`Updated user for ${doc.fullName}`);
      }

      // Check if doctor profile already exists
      let doctorProfile = await Doctor.findOne({ userId: user._id });

      if (!doctorProfile) {
        doctorProfile = new Doctor({
          userId: user._id,
          specialization: doc.specialization,
          experience: doc.experience,
          bio: doc.bio,
          profileImage: fullImageUrl,
          consultationFee: doc.consultationFee || 1500
        });
        await doctorProfile.save();
        console.log(`Created doctor profile for ${doc.fullName}`);
      } else {
        doctorProfile.profileImage = fullImageUrl;
        doctorProfile.specialization = doc.specialization;
        doctorProfile.experience = doc.experience;
        await doctorProfile.save();
        console.log(`Updated doctor profile for ${doc.fullName}`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDoctors();
