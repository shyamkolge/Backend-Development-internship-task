const joi = require('joi');

// User registration validation
const registerSchema = joi.object({
  username: joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
    }),
  email: joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  password: joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
    }),
  confirmPassword: joi.string()
    .valid(joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
    }),
});

// User login validation
const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

// Task creation validation
const createTaskSchema = joi.object({
  title: joi.string().min(3).max(255).required(),
  description: joi.string().max(1000).optional(),
  priority: joi.string().valid('low', 'medium', 'high').default('medium'),
});

// Task update validation
const updateTaskSchema = joi.object({
  title: joi.string().min(3).max(255).optional(),
  description: joi.string().max(1000).optional(),
  status: joi.string().valid('pending', 'in_progress', 'completed').optional(),
  priority: joi.string().valid('low', 'medium', 'high').optional(),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    req.validated = value;
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
};
