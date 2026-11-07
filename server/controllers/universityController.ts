import { Router, Request, Response } from 'express';
import { UniversityService } from '../services/universityService';

const router = Router();
const universityService = new UniversityService();

/**
 * @route GET /api/universities
 * @desc Get all universities with profiles and majors
 */
router.get('/', (req: Request, res: Response): void => {
  try {
    const data = universityService.getUniversities();
    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch universities.' });
  }
});

/**
 * @route GET /api/universities/:id
 * @desc Get single university by ID or abbreviation (e.g. 'cadt', 'itc')
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const university = universityService.getUniversityById(req.params.id);
    if (!university) {
      res.status(404).json({ success: false, error: 'University not found.' });
      return;
    }
    res.json({ success: true, data: university });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
