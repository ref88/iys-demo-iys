// 🛡️ Security Utilities for Nocto VMS
// Production-ready security implementation

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// Security configuration
const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'nocto-vms-secret-key-change-in-production',
  JWT_EXPIRES_IN: '24h',
  BCRYPT_ROUNDS: 12,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'nocto-encryption-key-change-in-production',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
};

// 🔐 Password Security
export const passwordUtils = {
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(SECURITY_CONFIG.BCRYPT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  },

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - Password matches
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - Validation result
   */
  validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    return {
      isValid: score >= 4,
      score: score,
      requirements: requirements,
      feedback: this.getPasswordFeedback(requirements, score)
    };
  },

  getPasswordFeedback(requirements, score) {
    const feedback = [];
    
    if (!requirements.minLength) feedback.push('Minimaal 8 karakters');
    if (!requirements.hasUppercase) feedback.push('Minimaal 1 hoofdletter');
    if (!requirements.hasLowercase) feedback.push('Minimaal 1 kleine letter');
    if (!requirements.hasNumbers) feedback.push('Minimaal 1 cijfer');
    if (!requirements.hasSpecialChars) feedback.push('Minimaal 1 speciaal karakter');
    
    if (score < 3) return { level: 'weak', message: 'Zwak wachtwoord', suggestions: feedback };
    if (score < 4) return { level: 'medium', message: 'Gemiddeld wachtwoord', suggestions: feedback };
    return { level: 'strong', message: 'Sterk wachtwoord', suggestions: [] };
  }
};

// 🎫 JWT Token Security
export const tokenUtils = {
  /**
   * Generate JWT token for user
   * @param {object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT
    };

    return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
      expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN
    });
  },

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token
   * @returns {object} - Decoded payload or null
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET);
      
      // Check if token is expired
      if (decoded.exp < Date.now()) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  },

  /**
   * Refresh token if it's close to expiration
   * @param {string} token - Current token
   * @returns {string|null} - New token or null
   */
  refreshToken(token) {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    // Refresh if token expires within 1 hour
    const oneHour = 60 * 60 * 1000;
    if (decoded.exp - Date.now() < oneHour) {
      return this.generateToken(decoded);
    }

    return token;
  }
};

// 🔒 Data Encryption
export const encryptionUtils = {
  /**
   * Encrypt sensitive data
   * @param {string} data - Data to encrypt
   * @returns {string} - Encrypted data
   */
  encrypt(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), SECURITY_CONFIG.ENCRYPTION_KEY).toString();
    } catch (error) {
      throw new Error('Encryption failed');
    }
  },

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Encrypted data
   * @returns {string} - Decrypted data
   */
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECURITY_CONFIG.ENCRYPTION_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
};

// 🛡️ Session Security
export const sessionUtils = {
  /**
   * Create secure session
   * @param {object} user - User object
   * @returns {object} - Session data
   */
  createSession(user) {
    const token = tokenUtils.generateToken(user);
    const sessionData = {
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      loginTime: Date.now(),
      lastActivity: Date.now(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // Encrypt session data before storing
    const encryptedSession = encryptionUtils.encrypt(sessionData);
    localStorage.setItem('nocto_session', encryptedSession);
    
    return sessionData;
  },

  /**
   * Get current session
   * @returns {object|null} - Session data or null
   */
  getSession() {
    try {
      const encryptedSession = localStorage.getItem('nocto_session');
      if (!encryptedSession) return null;

      const sessionData = encryptionUtils.decrypt(encryptedSession);
      
      // Verify token is still valid
      const isValidToken = tokenUtils.verifyToken(sessionData.token);
      if (!isValidToken) {
        this.clearSession();
        return null;
      }

      // Check session timeout
      const now = Date.now();
      if (now - sessionData.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }

      // Update last activity
      sessionData.lastActivity = now;
      const encryptedUpdated = encryptionUtils.encrypt(sessionData);
      localStorage.setItem('nocto_session', encryptedUpdated);

      return sessionData;
    } catch (error) {
      console.error('Session retrieval failed:', error);
      this.clearSession();
      return null;
    }
  },

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem('nocto_session');
    localStorage.removeItem('nocto_login_attempts');
    localStorage.removeItem('nocto_last_activity');
  },

  /**
   * Get client IP (mock implementation)
   * @returns {string} - Client IP
   */
  getClientIP() {
    // In a real implementation, this would come from server
    return '127.0.0.1';
  }
};

// 🚨 Rate Limiting & Brute Force Protection
export const rateLimitUtils = {
  /**
   * Check if user is rate limited
   * @param {string} identifier - User identifier (IP, username, etc.)
   * @returns {object} - Rate limit status
   */
  checkRateLimit(identifier) {
    const key = `rate_limit_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    
    // Remove old attempts (older than lockout time)
    const recentAttempts = attempts.filter(
      attempt => now - attempt < SECURITY_CONFIG.LOCKOUT_TIME
    );
    
    const isLocked = recentAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
    const remainingAttempts = Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - recentAttempts.length);
    
    return {
      isLocked,
      remainingAttempts,
      lockoutTime: isLocked ? Math.max(...recentAttempts) + SECURITY_CONFIG.LOCKOUT_TIME : null,
      resetTime: isLocked ? Math.ceil((Math.max(...recentAttempts) + SECURITY_CONFIG.LOCKOUT_TIME - now) / 1000) : null
    };
  },

  /**
   * Record failed login attempt
   * @param {string} identifier - User identifier
   */
  recordFailedAttempt(identifier) {
    const key = `rate_limit_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    attempts.push(Date.now());
    
    localStorage.setItem(key, JSON.stringify(attempts));
  },

  /**
   * Clear rate limit for successful login
   * @param {string} identifier - User identifier
   */
  clearRateLimit(identifier) {
    const key = `rate_limit_${identifier}`;
    localStorage.removeItem(key);
  }
};

// 🔍 Input Validation & Sanitization
export const validationUtils = {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Is valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Sanitize input string
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes to prevent injection
      .trim();
  },

  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {object} - Validation result
   */
  validateUsername(username) {
    const rules = {
      minLength: username.length >= 3,
      maxLength: username.length <= 50,
      validChars: /^[a-zA-Z0-9_.-]+$/.test(username),
      noSpaces: !username.includes(' ')
    };

    const isValid = Object.values(rules).every(Boolean);
    
    return {
      isValid,
      rules,
      message: isValid ? 'Geldige gebruikersnaam' : 'Ongeldige gebruikersnaam'
    };
  }
};

// 📊 Audit Logging
export const auditUtils = {
  /**
   * Log user action for audit trail
   * @param {string} action - Action performed
   * @param {object} details - Action details
   * @param {object} user - User who performed action
   */
  logAction(action, details, user) {
    const auditEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      ipAddress: sessionUtils.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    // Get existing audit log
    const auditLog = JSON.parse(localStorage.getItem('nocto_audit_log') || '[]');
    auditLog.push(auditEntry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
      auditLog.splice(0, auditLog.length - 1000);
    }
    
    localStorage.setItem('nocto_audit_log', JSON.stringify(auditLog));
    
    // Also log to console for development
    console.log('🔍 AUDIT LOG:', auditEntry);
  },

  /**
   * Get audit log entries
   * @param {object} filters - Filter options
   * @returns {array} - Audit log entries
   */
  getAuditLog(filters = {}) {
    const auditLog = JSON.parse(localStorage.getItem('nocto_audit_log') || '[]');
    
    return auditLog.filter(entry => {
      if (filters.userId && entry.user.id !== filters.userId) return false;
      if (filters.action && !entry.action.includes(filters.action)) return false;
      if (filters.startDate && new Date(entry.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(entry.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  },

  /**
   * Get session ID for audit logging
   * @returns {string} - Session ID
   */
  getSessionId() {
    const session = sessionUtils.getSession();
    return session ? session.token.substring(0, 10) : 'anonymous';
  }
};

// 🛡️ Security Headers & CSP
export const securityHeaders = {
  /**
   * Set security headers (for server-side implementation)
   * @returns {object} - Security headers
   */
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    };
  }
};

export default {
  passwordUtils,
  tokenUtils,
  encryptionUtils,
  sessionUtils,
  rateLimitUtils,
  validationUtils,
  auditUtils,
  securityHeaders,
  SECURITY_CONFIG
};