import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import { validateUpload } from '../validators/upload.validator';
import { uploadLecture } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  authenticate,
  upload.any(),
  validateUpload,
  uploadLecture
);

export default router;
