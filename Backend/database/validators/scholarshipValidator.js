/**
 * MongoDB validator for Scholarship collection
 * This validator can be applied directly to MongoDB to enforce schema validation at the database level
 */

exports.scholarshipValidator = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "amount", "deadlineDate", "createdBy", "status"],
      properties: {
        title: {
          bsonType: "string",
          description: "Title is required and must be a string",
          minLength: 3,
          maxLength: 200
        },
        description: {
          bsonType: "string",
          description: "Description is required and must be a string",
          minLength: 10
        },
        amount: {
          bsonType: "number",
          description: "Amount is required and must be a positive number",
          minimum: 1
        },
        currency: {
          bsonType: "string",
          description: "Currency must be a string if provided",
          default: "USD"
        },
        status: {
          bsonType: "string",
          description: "Status is required and must be one of the allowed values",
          enum: ["draft", "active", "paused", "expired", "closed"]
        },
        createdBy: {
          bsonType: "objectId",
          description: "Creator ID is required and must be an ObjectId"
        },
        criteria: {
          bsonType: "object",
          properties: {
            minGPA: {
              bsonType: "number",
              description: "Minimum GPA must be a number between 0 and 4 if provided",
              minimum: 0,
              maximum: 4
            },
            maxFamilyIncome: {
              bsonType: "number",
              description: "Maximum family income must be a non-negative number if provided",
              minimum: 0
            },
            requiredDocuments: {
              bsonType: "array",
              description: "Required documents must be an array if provided",
              items: {
                bsonType: "string"
              }
            },
            fieldOfStudy: {
              bsonType: "array",
              description: "Field of study must be an array if provided",
              items: {
                bsonType: "string"
              }
            },
            academicLevel: {
              bsonType: "array",
              description: "Academic level must be an array if provided",
              items: {
                bsonType: "string",
                enum: ["undergraduate", "graduate", "doctoral", "any"]
              }
            },
            minAge: {
              bsonType: "number",
              description: "Minimum age must be a non-negative number if provided",
              minimum: 0
            },
            maxAge: {
              bsonType: "number",
              description: "Maximum age must be a number greater than or equal to minimum age if provided",
              minimum: 0
            },
            gender: {
              bsonType: "string",
              description: "Gender must be one of the allowed values if provided",
              enum: ["male", "female", "any"]
            },
            nationality: {
              bsonType: "array",
              description: "Nationality must be an array if provided",
              items: {
                bsonType: "string"
              }
            },
            requiredEssays: {
              bsonType: "array",
              description: "Required essays must be an array if provided",
              items: {
                bsonType: "object",
                required: ["question"],
                properties: {
                  question: {
                    bsonType: "string",
                    description: "Essay question is required and must be a string"
                  },
                  wordLimit: {
                    bsonType: "number",
                    description: "Word limit must be a number if provided",
                    minimum: 10
                  }
                }
              }
            },
            otherRequirements: {
              bsonType: "string",
              description: "Other requirements must be a string if provided"
            }
          }
        },
        deadlineDate: {
          bsonType: "date",
          description: "Deadline date is required and must be a date"
        },
        startDate: {
          bsonType: "date",
          description: "Start date must be a date if provided"
        },
        maxApplicants: {
          bsonType: "number",
          description: "Maximum applicants must be a positive number if provided",
          minimum: 1
        },
        applicantCount: {
          bsonType: "number",
          description: "Applicant count must be a non-negative number",
          minimum: 0,
          default: 0
        },
        approvedCount: {
          bsonType: "number",
          description: "Approved count must be a non-negative number",
          minimum: 0,
          default: 0
        },
        fundedCount: {
          bsonType: "number",
          description: "Funded count must be a non-negative number",
          minimum: 0,
          default: 0
        },
        category: {
          bsonType: "string",
          description: "Category must be one of the allowed values if provided",
          enum: ["academic", "financial_need", "merit", "athletic", "community", "diversity", "research", "international", "other"]
        },
        tags: {
          bsonType: "array",
          description: "Tags must be an array if provided",
          items: {
            bsonType: "string"
          }
        },
        visible: {
          bsonType: "bool",
          description: "Visibility must be a boolean",
          default: true
        },
        featuredRank: {
          bsonType: "number",
          description: "Featured rank must be a number if provided",
          minimum: 0,
          default: 0
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
};

/**
 * Apply the validator to the MongoDB collection
 * 
 * @param {Object} db - MongoDB database instance
 * @returns {Promise} - Result of validator application
 */
exports.applyValidator = async (db) => {
  try {
    // Get the command object
    const command = {
      collMod: "scholarships",
      validator: exports.scholarshipValidator.validator,
      validationLevel: exports.scholarshipValidator.validationLevel,
      validationAction: exports.scholarshipValidator.validationAction
    };
    
    // Run the command to apply the validator
    const result = await db.command(command);
    
    return {
      success: true,
      message: "Scholarship validator applied successfully",
      result
    };
  } catch (error) {
    console.error("Error applying scholarship validator:", error);
    
    return {
      success: false,
      message: "Failed to apply scholarship validator",
      error: error.message
    };
  }
}; 