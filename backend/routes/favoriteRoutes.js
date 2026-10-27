import { Router } from 'express';
import { getMyFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateMiddleware.js';

const router = Router();

router.use(protect);
router.use(restrictTo('buyer'));

router.get('/', getMyFavorites);
router.post('/properties/:id/favorite', validateObjectId('id'), toggleFavorite);

export default router;
