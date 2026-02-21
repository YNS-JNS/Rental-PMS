import { User, IUser } from './user.model';
import { RegisterInput, LoginInput, UserRole } from '@rental/shared';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  compareRefreshToken,
} from './auth.utils';

/**
 * Auth Service
 * Handles business logic for user authentication.
 */
export const AuthService = {
  /**
   * Register a new user
   * 1. Check if email exists
   * 2. Create user (first user becomes SUPER_ADMIN)
   * 3. Generate dual tokens (access + refresh)
   * 4. Store hashed refresh token in DB
   */
  register: async (data: RegisterInput) => {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // First user in the system becomes SUPER_ADMIN
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? UserRole.SUPER_ADMIN : UserRole.ADMIN;

    // Create User (Password hashing is handled by Mongoose pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store hashed refresh token in DB
    const hashedRefreshToken = await hashRefreshToken(refreshToken);
    await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

    return { user, accessToken, refreshToken };
  },

  /**
   * Login a user
   * 1. Find user by email
   * 2. Verify password
   * 3. Migrate legacy roles if needed
   * 4. Generate dual tokens
   * 5. Store hashed refresh token in DB
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

    // --- Legacy role migration ---
    // If no SUPER_ADMIN exists in the entire system, promote this user
    const superAdminExists = await User.exists({ role: UserRole.SUPER_ADMIN });
    if (!superAdminExists) {
      user.role = UserRole.SUPER_ADMIN;
      await User.findByIdAndUpdate(user._id, { role: UserRole.SUPER_ADMIN });
    }
    // Migrate old 'STAFF' role (renamed to CLEANER)
    else if (user.role === ('STAFF' as any)) {
      user.role = UserRole.CLEANER;
      await User.findByIdAndUpdate(user._id, { role: UserRole.CLEANER });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store hashed refresh token in DB
    const hashedRefreshToken = await hashRefreshToken(refreshToken);
    await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

    return { user, accessToken, refreshToken };
  },

  /**
   * Refresh tokens (Rotation)
   * 1. Verify the refresh token JWT
   * 2. Find user and compare hashed token
   * 3. Generate new token pair
   * 4. Update DB with new hashed refresh token
   *
   * If the token is reused after rotation, it means it was stolen.
   * We clear the user's refresh token entirely (forced re-login).
   */
  refreshTokens: async (currentRefreshToken: string) => {
    // 1. Verify JWT structure & expiry
    const decoded = verifyRefreshToken(currentRefreshToken);
    const userId = decoded.id;

    // 2. Find user with their stored hashed refresh token
    const user = await User.findById(userId).select('+refreshToken');
    if (!user || !user.refreshToken) {
      throw new Error('Invalid refresh token — user not found or no token stored');
    }

    // 3. Compare provided token with hashed token in DB
    const isValid = await compareRefreshToken(currentRefreshToken, user.refreshToken);
    if (!isValid) {
      // Token reuse detected! Clear all tokens for this user (security measure)
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      throw new Error('Refresh token reuse detected — session invalidated');
    }

    // 4. Rotate: generate fresh token pair
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // 5. Store new hashed refresh token
    const hashedNewRefresh = await hashRefreshToken(newRefreshToken);
    await User.findByIdAndUpdate(userId, { refreshToken: hashedNewRefresh });

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  /**
   * Logout — Clear refresh token from DB
   * This invalidates the refresh token server-side.
   */
  logoutUser: async (userId: string) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  },

  /**
   * Get user by ID (for session rehydration via /me endpoint)
   */
  getUserById: async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
};
