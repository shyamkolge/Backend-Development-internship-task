const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const REFRESH_COOKIE_NAME = 'refreshToken';
const ACCESS_COOKIE_NAME = 'accessToken';

const isSecureRequest = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? String(forwardedProto).split(',')[0].trim() : req.protocol;
  return protocol === 'https';
};

const getCookieOptions = (req) => {
  const useSecureCookies = process.env.COOKIE_SECURE === 'true' || isSecureRequest(req);
  return {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: useSecureCookies ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: 14 * 24 * 60 * 60 * 1000,
  };
};

const getAccessCookieOptions = (req) => {
  const baseOptions = getCookieOptions(req);
  return {
    ...baseOptions,
    path: '/api/v1',
    maxAge: 15 * 60 * 1000,
  };
};

const buildTokenPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const createAccessToken = (user) => jwt.sign(
  buildTokenPayload(user),
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
);

const createRefreshToken = (user) => jwt.sign(
  { id: user.id, tokenType: 'refresh' },
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '14d' }
);

const setRefreshTokenCookie = (req, res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions(req));
};

const setAccessTokenCookie = (req, res, accessToken) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, getAccessCookieOptions(req));
};

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               confirmPassword:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
const register = async (req, res) => {

  try {
    const { username, email, password } = req.validated;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, 'user']
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
    
  } catch (error) {
    logger.error('Registration error', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user and set secure auth cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.validated;

    // Find user
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    setAccessTokenCookie(req, res, token);
    setRefreshTokenCookie(req, res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error('Login error', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved
 *       401:
 *         description: Unauthorized
 */
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get current user error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user info.',
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh-token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!tokenFromCookie) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is missing. Please log in again.',
      });
    }

    const decoded = jwt.verify(
      tokenFromCookie,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.',
      });
    }

    const result = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User is not active. Please log in again.',
      });
    }

    const nextAccessToken = createAccessToken(user);
    const nextRefreshToken = createRefreshToken(user);
    setAccessTokenCookie(req, res, nextAccessToken);
    setRefreshTokenCookie(req, res, nextRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        user: buildTokenPayload(user),
      },
    });
  } catch (error) {
    res.clearCookie(ACCESS_COOKIE_NAME, getAccessCookieOptions(req));
    res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions(req));
    return res.status(401).json({
      success: false,
      message: 'Refresh token is invalid or expired. Please log in again.',
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and clear refresh-token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
const logout = async (req, res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, getAccessCookieOptions(req));
  res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions(req));
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
};
