import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AIService } from '../../services/ai.service';

const router = Router();
router.use(authenticate);

/**
 * @route   POST /api/ai/generate-content
 * @desc    Generate content using AI
 * @access  Private
 */
router.post(
  '/generate-content',
  [
    body('brandId').notEmpty().withMessage('Brand ID is required'),
    body('prompt').optional().isString(),
    body('contentType').optional().isIn(['post', 'caption', 'hashtags', 'video-script']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map((e) => e.msg).join(', '), 400);
    }

    const result = await AIService.generateContentWithClaude(req.body);

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/ai/generate-hashtags
 * @desc    Generate hashtags for a topic
 * @access  Private
 */
router.post(
  '/generate-hashtags',
  [
    body('topic').notEmpty().withMessage('Topic is required'),
    body('brandId').notEmpty().withMessage('Brand ID is required'),
    body('count').optional().isInt({ min: 1, max: 30 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map((e) => e.msg).join(', '), 400);
    }

    const result = await AIService.generateHashtags(req.body);

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/ai/generate-image
 * @desc    Generate image using AI
 * @access  Private
 */
router.post(
  '/generate-image',
  [
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('brandId').notEmpty().withMessage('Brand ID is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map((e) => e.msg).join(', '), 400);
    }

    const result = await AIService.generateImageWithDALLE(req.body);

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/ai/generate-video-script
 * @desc    Generate video script
 * @access  Private
 */
router.post(
  '/generate-video-script',
  [
    body('topic').notEmpty().withMessage('Topic is required'),
    body('brandId').notEmpty().withMessage('Brand ID is required'),
    body('duration').isInt({ min: 5, max: 300 }).withMessage('Duration must be between 5-300 seconds'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map((e) => e.msg).join(', '), 400);
    }

    const result = await AIService.generateVideoScript(req.body);

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/ai/post-ideas
 * @desc    Generate post ideas
 * @access  Private
 */
router.post(
  '/post-ideas',
  [
    body('brandId').notEmpty().withMessage('Brand ID is required'),
    body('count').optional().isInt({ min: 1, max: 20 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map((e) => e.msg).join(', '), 400);
    }

    const { brandId, count } = req.body;
    const result = await AIService.generatePostIdeas(brandId, count);

    res.json({
      status: 'success',
      data: result,
    });
  })
);

export default router;
