import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getAddDoctorEmail, 
  getContactFormEmail, 
  getNewAppointmentBookedEmail, 
  getRequestReceivedEmail, 
  getAppointmentStatusEmail 
} from '../utils/emailTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const previewDir = path.join(__dirname, '../temp_previews');
if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir);
}

const templates = [
  {
    name: '1_welcome_doctor.html',
    html: getAddDoctorEmail('John Smith', 'john.smith@example.com', 'Welcome123')
  },
  {
    name: '2_contact_inquiry.html',
    html: getContactFormEmail('Jane Doe', 'jane.doe@example.com', 'Appointment Question', 'Hello, I would like to know if you accept insurance from XYZ Company. Please let me know. Thanks!')
  },
  {
    name: '3_new_appointment_doctor.html',
    html: getNewAppointmentBookedEmail('John Smith', 'Jane Doe', '2026-05-20', '10:30 AM', '64b1f8e2c9a1d50012345678')
  },
  {
    name: '4_request_received_patient.html',
    html: getRequestReceivedEmail('Jane Doe', 'John Smith', '2026-05-20', '10:30 AM')
  },
  {
    name: '5_appointment_approved.html',
    html: getAppointmentStatusEmail('Appointment Approved', 'Jane Doe', 'John Smith', '2026-05-20', '10:30 AM', '64b1f8e2c9a1d50012345678', 'approved')
  },
  {
    name: '6_appointment_rejected.html',
    html: getAppointmentStatusEmail('Appointment Rejected', 'Jane Doe', 'John Smith', '2026-05-20', '10:30 AM', '64b1f8e2c9a1d50012345678', 'rejected')
  },
  {
    name: '7_appointment_completed.html',
    html: getAppointmentStatusEmail('Appointment Completed', 'Jane Doe', 'John Smith', '2026-05-20', '10:30 AM', '64b1f8e2c9a1d50012345678', 'completed')
  }
];

templates.forEach(t => {
  const filePath = path.join(previewDir, t.name);
  fs.writeFileSync(filePath, t.html);
  console.log(`Generated preview: ${filePath}`);
});

console.log('\nAll email previews generated in backend/temp_previews/');
