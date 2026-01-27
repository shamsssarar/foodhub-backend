import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new Error('You are not authorized!');
      }

      // Verify Token
      const verifiedUser = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as JwtPayload;

      req.user = verifiedUser;

      // Check Role
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new Error('Forbidden Access');
      }

      next();
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || 'Unauthorized',
      });
    }
  };
};

export default auth;