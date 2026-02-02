import { User, IUser } from './user.model';
import { RegisterInput, LoginInput } from '@rental/shared';
import { generateToken } from './auth.utils';

/**
 * Auth Service
 * Handles business logic for user authentication.
 */
export const AuthService = {
  /**
   * Register a new user
   * 1. Check if email exists
   * 2. Create user
   * 3. Generate Token
   */
  register: async (data: RegisterInput) => {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Create User (Password hashing is handled by Mongoose pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate JWT
    const token = generateToken(user._id.toString(), user.role);

    return { user, token };
  },

  /**
   * Login a user
   * 1. Find user by email
   * 2. Verify password
   * 3. Generate Token
   */
  login: async (data: LoginInput) => {
    const { email, password } = data;

    // Check if user exists (Select password explicitly as it is hidden by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = generateToken(user._id.toString(), user.role);

    return { user, token };
  },
};
