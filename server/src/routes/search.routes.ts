import { Router } from 'express';
import { SearchController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.get('/', authenticate, SearchController.globalSearch);

export default router;
