import { Router } from 'express';
import {
  getMyVisits,
  getReceivedVisits,
  updateVisitStatus
} from '../controllers/visitController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate, validateObjectId } from '../middleware/validateMiddleware.js';
import { visitStatusSchema } from '../utils/zodSchemas.js';

const router = Router();

router.use(protect);

// Buyer gets their scheduled visits
router.get('/my', restrictTo('buyer'), getMyVisits);

// Seller gets received visit requests
router.get('/received', restrictTo('seller'), getReceivedVisits);

// Update visit status (state machine transition)
router.patch(
  '/:id/status',
  validateObjectId('id'),
  validate(visitStatusSchema),
  updateVisitStatus
);

export default router;
