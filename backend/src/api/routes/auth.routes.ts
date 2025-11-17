import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../../services/auth.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  asyncHandler(async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        errors.array().map((e) => e.msg).join(', '),
        400
      );
    }

    const { email, password, name } = req.body;
    const result = await AuthService.register({ email, password, name });

    res.status(201).json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        errors.array().map((e) => e.msg).join(', '),
        400
      );
    }

    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        errors.array().map((e) => e.msg).join(', '),
        400
      );
    }

    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        errors.array().map((e) => e.msg).join(', '),
        400
      );
    }

    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(
      req.user!.id,
      currentPassword,
      newPassword
    );

    res.json({
      status: 'success',
      data: result,
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  })
);

export default router;
