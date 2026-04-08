import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  createPrescription, 
  getPrescriptions,
  getPatientPrescriptions
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/', protect, getPrescriptions);
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientPrescriptions);

export default router;
