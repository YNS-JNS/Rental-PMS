import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

/**
 * Generates a JSON Web Token (JWT) for a user.
 * This token will be sent to the client and used for subsequent requests.
 * @param userId - The ID of the user (MongoDB _id)
 * @param role - The role of the user (for quick frontend checks)
 * @returns Signed JWT string
 */
export const generateToken = (userId: string, role: string): string => {
  const payload = { id: userId, role };

  // TypeScript Fix: We explicitly cast the environment variable
  // to the specific type expected by the library (SignOptions['expiresIn']).
  const signInOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_SECRET, signInOptions);
};
