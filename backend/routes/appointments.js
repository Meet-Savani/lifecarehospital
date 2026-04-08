import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAdminAppointments,
  getAdminRecentAppointments,
  getAdminStats,
  rescheduleAppointment,
  getBookedSlots
} from '../controllers/appointmentController.js';
import {
  getDoctors,
  addDoctor,
  getDoctorMe,
  updateDoctor,
  deleteDoctor,
  setUnavailability,
  getUnavailability
} from '../controllers/doctorController.js';

const router = express.Router();

// Doctor routes
router.get('/doctors', getDoctors);
router.post('/doctors', protect, authorize('admin'), addDoctor);
// Need to add PUT and DELETE for AdminDoctors
router.put('/doctors/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.delete('/doctors/:id', protect, authorize('admin'), deleteDoctor);

// Admin / Doctor specific routes
router.get('/doctor/me', protect, authorize('doctor'), getDoctorMe);
router.post('/doctor/unavailability', protect, authorize('doctor'), setUnavailability);
router.get('/doctor/unavailability', protect, authorize('doctor'), getUnavailability);

// Appointments routes
// Note: frontend calls /appointments/appointments because of the router mount point.
router.get('/appointments', protect, getAppointments);
router.post('/appointments', protect, createAppointment);

// Admin side appointments
router.get('/admin/appointments', protect, authorize('admin'), getAdminAppointments);
router.put('/appointments/:id/status', protect, updateAppointmentStatus); // Used by admin/doctor/patient
router.put('/appointments/:id/reschedule', protect, rescheduleAppointment); // Used by patient
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/recent-appointments', protect, authorize('admin'), getAdminRecentAppointments);
router.get('/doctor/:doctorId/booked-slots', protect, getBookedSlots);

export default router;
