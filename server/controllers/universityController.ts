import { Router, Request, Response } from 'express';
import { UniversityService } from '../services/universityService';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const universityService = new UniversityService();

/** GET /api/universities */
router.get('/', (_req: Request, res: Response): void => {
  try {
    const data = universityService.getUniversities();
    res.json({ success: true, data, count: data.length });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to fetch universities.', 500),
    });
  }
});

/** GET /api/universities/:id */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const university = universityService.getUniversityById(req.params.id);
    if (!university) {
      res.status(404).json({ success: false, error: 'University not found.' });
      return;
    }
    res.json({ success: true, data: university });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to fetch university.', 500),
    });
  }
});

export default router;
