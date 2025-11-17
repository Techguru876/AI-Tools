import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { AppError } from './errorHandler';
import { UserRole } from '@prisma/client';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        organizationId?: string;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JWTPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

/**
 * Check if user belongs to organization
 */
export const checkOrganizationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const organizationId = req.params.organizationId || req.body.organizationId;
    if (!organizationId) {
      throw new AppError('Organization ID required', 400);
    }

    // Super admin has access to all organizations
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user is member or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.user.id,
        },
      },
    });

    const isOwner = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerId: req.user.id,
      },
    });

    if (!membership && !isOwner) {
      throw new AppError('No access to this organization', 403);
    }

    req.user.organizationId = organizationId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has brand access
 */
export const checkBrandAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const brandId = req.params.brandId || req.body.brandId;
    if (!brandId) {
      throw new AppError('Brand ID required', 400);
    }

    // Get brand with organization
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        organization: true,
      },
    });

    if (!brand) {
      throw new AppError('Brand not found', 404);
    }

    // Super admin has access
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user is organization owner
    if (brand.organization.ownerId === req.user.id) {
      return next();
    }

    // Check if user is organization member
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: brand.organizationId,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      throw new AppError('No access to this brand', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
