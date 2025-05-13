// validation.js - schemas for auth routes
const Joi = require('joi');

// Define validation schemas for different routes
const schemas = {
  auth: {
    register: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      }),
      firstName: Joi.string().trim().required().messages({
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().trim().allow('').optional(),
      role: Joi.string().valid('student', 'donor', 'admin').default('student'),
      phoneNumber: Joi.string().trim().required().messages({
        'any.required': 'Phone number is required'
      }),
      // Student fields
      dateOfBirth: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.string().required().messages({
          'any.required': 'Date of birth is required'
        }),
        otherwise: Joi.string().optional()
      }),
      gender: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.string().valid('male', 'female', 'other').required().messages({
          'any.required': 'Gender is required',
          'any.only': 'Gender must be male, female, or other'
        }),
        otherwise: Joi.string().optional()
      }),
      cnic: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.string().pattern(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/).required().messages({
          'any.required': 'CNIC is required',
          'string.pattern.base': 'CNIC must be in the format 12345-1234567-1'
        }),
        otherwise: Joi.string().optional()
      }),
      institution: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.string().required().messages({
          'any.required': 'Institution is required'
        }),
        otherwise: Joi.string().optional()
      }),
      program: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.string().required().messages({
          'any.required': 'Program is required'
        }),
        otherwise: Joi.string().optional()
      }),
      currentYear: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.number().integer().min(1).max(10).required().messages({
          'any.required': 'Current year is required',
          'number.base': 'Current year must be a number',
          'number.min': 'Current year must be at least 1',
          'number.max': 'Current year must be at most 10'
        }),
        otherwise: Joi.number().optional()
      }),
      expectedGraduationYear: Joi.alternatives().conditional('role', {
        is: 'student',
        then: Joi.number().integer().min(new Date().getFullYear()).required().messages({
          'any.required': 'Expected graduation year is required',
          'number.base': 'Expected graduation year must be a number',
          'number.min': 'Expected graduation year must be in the future'
        }),
        otherwise: Joi.number().optional()
      }),
      currentGPA: Joi.number().min(0).max(4).allow(null).optional().default(null).messages({
        'number.base': 'GPA must be a number if provided.',
        'number.min': 'GPA cannot be negative if provided.',
        'number.max': 'GPA cannot be greater than 4 if provided.'
      }),
      // Donor fields
      donorType: Joi.alternatives().conditional('role', {
        is: 'donor',
        then: Joi.string().valid('individual', 'organization').required().messages({
          'any.required': 'Donor type is required',
          'any.only': 'Donor type must be individual or organization'
        }),
        otherwise: Joi.string().optional()
      }),
      organizationName: Joi.alternatives().conditional('donorType', {
        is: 'organization',
        then: Joi.string().required().messages({
          'any.required': 'Organization name is required'
        }),
        otherwise: Joi.string().allow('').optional()
      })
    }),
    
    login: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required'
      })
    }),
    
    refreshToken: Joi.object({
      refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required'
      })
    }),
    
    forgotPassword: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
    }),
    
    resetPassword: Joi.object({
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      })
    })
  },
  
  // Add student validation schemas
  student: {
    profile: Joi.object({
      firstName: Joi.string().trim().required().messages({
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().trim().allow('').optional(),
      phoneNumber: Joi.string().trim().required().messages({
        'any.required': 'Phone number is required'
      }),
      dateOfBirth: Joi.string().required().messages({
        'any.required': 'Date of birth is required'
      }),
      gender: Joi.string().valid('male', 'female', 'other', 'prefer not to say').required().messages({
        'any.required': 'Gender is required',
        'any.only': 'Gender must be male, female, other, or prefer not to say'
      }),
      institution: Joi.string().required().messages({
        'any.required': 'Institution is required'
      }),
      program: Joi.string().required().messages({
        'any.required': 'Program is required'
      }),
      currentYear: Joi.number().integer().min(1).max(10).required().messages({
        'any.required': 'Current year is required',
        'number.base': 'Current year must be a number',
        'number.min': 'Current year must be at least 1',
        'number.max': 'Current year must be at most 10'
      }),
      expectedGraduationYear: Joi.number().integer().min(new Date().getFullYear()).required().messages({
        'any.required': 'Expected graduation year is required',
        'number.base': 'Expected graduation year must be a number',
        'number.min': 'Expected graduation year must be in the future'
      }),
      currentGPA: Joi.number().min(0).max(4).allow(null).optional().default(null).messages({
        'number.base': 'GPA must be a number if provided.',
        'number.min': 'GPA cannot be negative if provided.',
        'number.max': 'GPA cannot be greater than 4 if provided.'
      }),
      address: Joi.object({
        street: Joi.string().required().messages({
          'any.required': 'Street address is required'
        }),
        city: Joi.string().required().messages({
          'any.required': 'City is required'
        }),
        state: Joi.string().required().messages({
          'any.required': 'State/Province is required'
        }),
        postalCode: Joi.string().required().messages({
          'any.required': 'Postal code is required'
        }),
        country: Joi.string().required().messages({
          'any.required': 'Country is required'
        })
      }).optional(),
      financialInfo: Joi.object({
        familyIncome: Joi.number().positive().empty(null).optional().default(null).messages({
          'number.base': 'Family income must be a number if provided.',
          'number.positive': 'Family income must be positive if provided.'
        }),
        dependentFamilyMembers: Joi.number().integer().min(0).empty(null).optional().default(null).messages({
          'number.base': 'Dependent family members must be a number if provided.',
          'number.min': 'Dependent family members cannot be negative if provided.'
        }),
        fafsaCompleted: Joi.boolean().allow(null).optional().default(false),
        externalAidAmount: Joi.number().min(0).allow(null).optional().default(0).messages({
          'number.base': 'External aid amount must be a number if provided.',
          'number.min': 'External aid amount cannot be negative if provided.'
        })
      }).optional()
    }),
    
    applyScholarship: Joi.object({
      academicInfo: Joi.object({
        gpa: Joi.number().min(0).max(4).required().messages({
          'any.required': 'GPA is required',
          'number.base': 'GPA must be a number',
          'number.min': 'GPA cannot be negative',
          'number.max': 'GPA cannot exceed 4.0'
        }),
        transcriptUrl: Joi.string().required().messages({
          'any.required': 'Transcript URL is required'
        })
      }).required(),
      statement: Joi.string().min(10).max(2000).required().messages({
        'any.required': 'Personal statement is required',
        'string.min': 'Personal statement must be at least 10 characters',
        'string.max': 'Personal statement cannot exceed 2000 characters'
      }),
      documents: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('transcript', 'recommendation', 'financial', 'other').required(),
          url: Joi.string().required().messages({
            'string.empty': 'Document URL must not be empty'
          }),
          name: Joi.string().required()
        })
      ).optional()
    })
  },
  
  // Add donor validation schemas
  donor: {
    profile: Joi.object({
      firstName: Joi.string().trim().required().messages({
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().trim().allow('').optional(),
      phoneNumber: Joi.string().trim().required().messages({
        'any.required': 'Phone number is required'
      }),
      donorType: Joi.string().valid('individual', 'organization').required().messages({
        'any.required': 'Donor type is required',
        'any.only': 'Donor type must be individual or organization'
      }),
      organizationName: Joi.alternatives().conditional('donorType', {
        is: 'organization',
        then: Joi.string().required().messages({
          'any.required': 'Organization name is required'
        }),
        otherwise: Joi.string().allow('').optional()
      }),
      bio: Joi.string().trim().allow('').optional(),
      taxId: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().required().messages({
          'any.required': 'Street address is required'
        }),
        city: Joi.string().required().messages({
          'any.required': 'City is required'
        }),
        state: Joi.string().required().messages({
          'any.required': 'State/Province is required'
        }),
        postalCode: Joi.string().required().messages({
          'any.required': 'Postal code is required'
        }),
        country: Joi.string().required().messages({
          'any.required': 'Country is required'
        })
      }).optional(),
      preferredCommunication: Joi.string().valid('email', 'phone', 'mail').default('email').optional(),
      donationPreferences: Joi.object({
        preferredCategories: Joi.array().items(
          Joi.string().valid('academic', 'financial', 'merit', 'need-based', 'any')
        ).optional(),
        preferredInstitutions: Joi.array().items(Joi.string()).optional(),
        preferredPrograms: Joi.array().items(Joi.string()).optional(),
        isAnonymous: Joi.boolean().default(false).optional()
      }).optional()
    }),
    
    makeDonation: Joi.object({
      studentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'any.required': 'Student ID is required',
        'string.pattern.base': 'Student ID must be a valid MongoDB ObjectId'
      }),
      scholarshipId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'any.required': 'Scholarship ID is required',
        'string.pattern.base': 'Scholarship ID must be a valid MongoDB ObjectId'
      }),
      amount: Joi.number().positive().required().messages({
        'any.required': 'Donation amount is required',
        'number.base': 'Donation amount must be a number',
        'number.positive': 'Donation amount must be positive'
      }),
      paymentMethod: Joi.string().valid('credit', 'debit', 'bank_transfer', 'paypal').required().messages({
        'any.required': 'Payment method is required',
        'any.only': 'Payment method must be credit, debit, bank_transfer, or paypal'
      }),
      paymentDetails: Joi.object({
        cardNumber: Joi.alternatives().conditional('paymentMethod', {
          is: Joi.string().valid('credit', 'debit'),
          then: Joi.string().pattern(/^\d{16}$/).required().messages({
            'any.required': 'Card number is required',
            'string.pattern.base': 'Card number must be 16 digits'
          }),
          otherwise: Joi.string().optional()
        }),
        expiryDate: Joi.alternatives().conditional('paymentMethod', {
          is: Joi.string().valid('credit', 'debit'),
          then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).required().messages({
            'any.required': 'Expiry date is required',
            'string.pattern.base': 'Expiry date must be in MM/YY format'
          }),
          otherwise: Joi.string().optional()
        }),
        cvv: Joi.alternatives().conditional('paymentMethod', {
          is: Joi.string().valid('credit', 'debit'),
          then: Joi.string().pattern(/^\d{3,4}$/).required().messages({
            'any.required': 'CVV is required',
            'string.pattern.base': 'CVV must be 3 or 4 digits'
          }),
          otherwise: Joi.string().optional()
        }),
        accountNumber: Joi.alternatives().conditional('paymentMethod', {
          is: 'bank_transfer',
          then: Joi.string().required().messages({
            'any.required': 'Account number is required'
          }),
          otherwise: Joi.string().optional()
        }),
        routingNumber: Joi.alternatives().conditional('paymentMethod', {
          is: 'bank_transfer',
          then: Joi.string().required().messages({
            'any.required': 'Routing number is required'
          }),
          otherwise: Joi.string().optional()
        }),
        paypalEmail: Joi.alternatives().conditional('paymentMethod', {
          is: 'paypal',
          then: Joi.string().email().required().messages({
            'any.required': 'PayPal email is required',
            'string.email': 'PayPal email must be a valid email'
          }),
          otherwise: Joi.string().optional()
        })
      }).required(),
      isAnonymous: Joi.boolean().default(false).optional(),
      note: Joi.string().max(500).optional().messages({
        'string.max': 'Note cannot exceed 500 characters'
      })
    }),

    createScholarship: Joi.object({
      name: Joi.string().min(2).max(100),
      title: Joi.string().min(2).max(100),
      description: Joi.string().required(),
      amount: Joi.number().required(),
      deadline: Joi.date().required(),
      category: Joi.string().required(),
      eligibilityRequirements: Joi.string().min(1).required(), // case-sensitive
    }).or('name', 'title') // At least one of name or title is required
  },
  
  // Add admin validation schemas
  admin: {
    createScholarship: Joi.object({
      name: Joi.string().required().messages({
        'any.required': 'Scholarship name is required'
      }),
      description: Joi.string().required().messages({
        'any.required': 'Scholarship description is required'
      }),
      criteria: Joi.object({
        minGPA: Joi.number().min(0).max(4).required().messages({
          'any.required': 'Minimum GPA is required',
          'number.base': 'Minimum GPA must be a number',
          'number.min': 'Minimum GPA cannot be negative',
          'number.max': 'Minimum GPA cannot exceed 4.0'
        }),
        requiredDocuments: Joi.array().items(
          Joi.string().valid('transcript', 'recommendation', 'financial', 'id', 'essay')
        ).required().messages({
          'any.required': 'Required documents must be specified'
        }),
        eligibleInstitutions: Joi.array().items(Joi.string()).optional(),
        eligiblePrograms: Joi.array().items(Joi.string()).optional(),
        maxFamilyIncome: Joi.number().positive().optional(),
        additionalCriteria: Joi.array().items(Joi.string()).optional()
      }).required(),
      amount: Joi.number().positive().required().messages({
        'any.required': 'Scholarship amount is required',
        'number.base': 'Scholarship amount must be a number',
        'number.positive': 'Scholarship amount must be positive'
      }),
      deadline: Joi.date().greater('now').required().messages({
        'any.required': 'Application deadline is required',
        'date.base': 'Application deadline must be a valid date',
        'date.greater': 'Application deadline must be in the future'
      }),
      category: Joi.string().valid(
        'academic', 'financial', 'merit', 'need-based', 'sports', 'arts', 'community', 'other'
      ).required().messages({
        'any.required': 'Scholarship category is required',
        'any.only': 'Invalid scholarship category'
      }),
      isFeatured: Joi.boolean().default(false).optional(),
      isActive: Joi.boolean().default(true).optional(),
      maxApplicants: Joi.number().integer().positive().optional().messages({
        'number.base': 'Max applicants must be a number',
        'number.positive': 'Max applicants must be positive'
      }),
      donorId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
        'string.pattern.base': 'Donor ID must be a valid MongoDB ObjectId'
      })
    }),
    
    updateUser: Joi.object({
      firstName: Joi.string().trim().optional(),
      lastName: Joi.string().trim().allow('').optional(),
      phoneNumber: Joi.string().trim().optional(),
      role: Joi.string().valid('student', 'donor', 'admin').optional(),
      isActive: Joi.boolean().optional()
    }),
    
    createUser: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
      firstName: Joi.string().trim().required().messages({
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().trim().allow('').optional(),
      role: Joi.string().valid('student', 'donor', 'admin').required().messages({
        'any.required': 'Role is required',
        'any.only': 'Role must be student, donor, or admin'
      }),
      phoneNumber: Joi.string().trim().required().messages({
        'any.required': 'Phone number is required'
      }),
      isActive: Joi.boolean().default(true).optional()
    }),

    reviewApplication: Joi.object({
      status: Joi.string().valid('approved', 'rejected').required().messages({
        'any.required': 'Status is required',
        'any.only': 'Status must be either approved or rejected'
      }),
      reason: Joi.string().when('status', {
        is: 'rejected',
        then: Joi.string().required().messages({
          'any.required': 'Reason is required when rejecting an application'
        }),
        otherwise: Joi.string().allow('').optional()
      })
    }),

    reviewScholarship: Joi.object({
      // ... existing code ...
    })
  },
  
  // Add payment validation schemas
  payment: {
    makeDonation: Joi.object({
      studentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'any.required': 'Student ID is required',
        'string.pattern.base': 'Student ID must be a valid MongoDB ObjectId'
      }),
      scholarshipId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'any.required': 'Scholarship ID is required',
        'string.pattern.base': 'Scholarship ID must be a valid MongoDB ObjectId'
      }),
      amount: Joi.number().positive().required().messages({
        'any.required': 'Donation amount is required',
        'number.base': 'Donation amount must be a number',
        'number.positive': 'Donation amount must be positive'
      }),
      paymentMethod: Joi.string().valid('credit', 'debit', 'bank_transfer', 'paypal').required().messages({
        'any.required': 'Payment method is required',
        'any.only': 'Payment method must be credit, debit, bank_transfer, or paypal'
      }),
      paymentDetails: Joi.object({
        cardNumber: Joi.alternatives().conditional('paymentMethod', {
          is: Joi.string().valid('credit', 'debit'),
          then: Joi.string().pattern(/^\d{16}$/).required().messages({
            'any.required': 'Card number is required',
            'string.pattern.base': 'Card number must be 16 digits'
          }),
          otherwise: Joi.string().optional()
        }),
        expiryDate: Joi.alternatives().conditional('paymentMethod', {
          is: Joi.string().valid('credit', 'debit'),
          then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).required().messages({
            'any.required': 'Expiry date is required',
            'string.pattern.base': 'Expiry date must be in MM/YY format'
          }),
          otherwise: Joi.string().optional()
        }),
        cvv: Joi.alternatives().conditional('paymentMethod', {
          is: Joi.string().valid('credit', 'debit'),
          then: Joi.string().pattern(/^\d{3,4}$/).required().messages({
            'any.required': 'CVV is required',
            'string.pattern.base': 'CVV must be 3 or 4 digits'
          }),
          otherwise: Joi.string().optional()
        }),
        accountNumber: Joi.alternatives().conditional('paymentMethod', {
          is: 'bank_transfer',
          then: Joi.string().required().messages({
            'any.required': 'Account number is required'
          }),
          otherwise: Joi.string().optional()
        }),
        routingNumber: Joi.alternatives().conditional('paymentMethod', {
          is: 'bank_transfer',
          then: Joi.string().required().messages({
            'any.required': 'Routing number is required'
          }),
          otherwise: Joi.string().optional()
        }),
        paypalEmail: Joi.alternatives().conditional('paymentMethod', {
          is: 'paypal',
          then: Joi.string().email().required().messages({
            'any.required': 'PayPal email is required',
            'string.email': 'PayPal email must be a valid email'
          }),
          otherwise: Joi.string().optional()
        })
      }).required(),
      isAnonymous: Joi.boolean().default(false).optional(),
      note: Joi.string().max(500).optional().messages({
        'string.max': 'Note cannot exceed 500 characters'
      })
    }),
    
    updateStatus: Joi.object({
      status: Joi.string().valid(
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
      ).required().messages({
        'any.required': 'Payment status is required',
        'any.only': 'Invalid payment status'
      }),
      notes: Joi.string().max(500).optional().messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
    }),
    
    refundPayment: Joi.object({
      reason: Joi.string().required().messages({
        'any.required': 'Refund reason is required'
      }),
      amount: Joi.number().positive().required().messages({
        'any.required': 'Refund amount is required',
        'number.base': 'Refund amount must be a number',
        'number.positive': 'Refund amount must be positive'
      }),
      refundMethod: Joi.string().valid(
        'original_payment', 'bank_transfer', 'credit'
      ).required().messages({
        'any.required': 'Refund method is required',
        'any.only': 'Invalid refund method'
      }),
      notes: Joi.string().max(500).optional().messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
    })
  },
  
  // Common validation schemas
  common: {
    id: Joi.object({
      id: Joi.string().required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.empty': 'ID is required',
          'any.required': 'ID is required',
          'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
        })
    }),

    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1)
        .messages({
          'number.base': 'Page must be a number',
          'number.min': 'Page must be at least 1'
        }),
      limit: Joi.number().integer().min(1).max(100).default(10)
        .messages({
          'number.base': 'Limit must be a number',
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 100'
        })
    })
  }
};

// Middleware to validate request data
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: errorMessages[0],
        errors: errorMessages
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};