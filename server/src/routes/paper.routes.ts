import { Router } from 'express';
import { PaperController } from '../controllers';
import { authenticate, upload, validate } from '../middleware';
import { paperSchema } from '../validators';

const router = Router();

// Dashboard stats (must be before /:id)
router.get('/dashboard/stats', authenticate, PaperController.getStudentDashboardStats);

// Recent and bookmarks (must be before /:id)
router.get('/recent', authenticate, PaperController.getRecentPapers);
router.get('/bookmarks', authenticate, PaperController.getBookmarks);
router.get('/downloads', authenticate, PaperController.getRecentDownloads);

  // CRUD
router.get('/', authenticate, PaperController.getPapers);
router.get('/:id', authenticate, PaperController.getPaperById);
router.post('/upload', authenticate, upload.single('file'), PaperController.uploadPaper);
router.put('/:id', authenticate, validate(paperSchema.partial()), PaperController.updatePaper);
router.delete('/:id', authenticate, PaperController.deletePaper);
router.get('/:id/download', authenticate, PaperController.downloadPaper);
router.get('/:id/preview', authenticate, PaperController.previewPaper);
router.post('/:id/bookmark', authenticate, PaperController.bookmarkPaper);
router.delete('/:id/bookmark', authenticate, PaperController.removeBookmark);

export default router;
