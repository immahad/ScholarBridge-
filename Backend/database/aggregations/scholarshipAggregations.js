const { ObjectId } = require('mongodb');

/**
 * MongoDB aggregation pipelines for scholarship data analysis
 */

/**
 * Get scholarship statistics by status
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getScholarshipStatsByStatus = () => {
  return [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        avgAmount: { $round: ['$avgAmount', 2] },
        minAmount: 1,
        maxAmount: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ];
};

/**
 * Get scholarship distribution by category
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getScholarshipDistributionByCategory = () => {
  return [
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        scholarships: { 
          $push: { 
            id: '$_id', 
            title: '$title',
            amount: '$amount',
            status: '$status'
          } 
        }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        totalAmount: 1,
        averageAmount: { $round: [{ $divide: ['$totalAmount', '$count'] }, 2] },
        scholarships: { $slice: ['$scholarships', 5] }, // Limit to 5 scholarships per category
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ];
};

/**
 * Get scholarship application statistics
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getScholarshipApplicationStats = () => {
  return [
    {
      $project: {
        _id: 1,
        title: 1,
        amount: 1,
        status: 1,
        applicantCount: { $ifNull: ['$applicantCount', 0] },
        approvedCount: { $ifNull: ['$approvedCount', 0] },
        fundedCount: { $ifNull: ['$fundedCount', 0] },
        conversionRate: {
          $cond: [
            { $eq: ['$applicantCount', 0] },
            0,
            { 
              $round: [
                { 
                  $multiply: [
                    { $divide: ['$approvedCount', '$applicantCount'] }, 
                    100
                  ] 
                }, 
                1
              ] 
            }
          ]
        },
        fundingRate: {
          $cond: [
            { $eq: ['$approvedCount', 0] },
            0,
            { 
              $round: [
                { 
                  $multiply: [
                    { $divide: ['$fundedCount', '$approvedCount'] }, 
                    100
                  ] 
                }, 
                1
              ] 
            }
          ]
        }
      }
    },
    { $sort: { applicantCount: -1 } }
  ];
};

/**
 * Get scholarships with upcoming deadlines
 * 
 * @param {Number} daysThreshold - Number of days to consider (default: 30)
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getUpcomingDeadlineScholarships = (daysThreshold = 30) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);
  
  return [
    {
      $match: {
        status: 'active',
        deadlineDate: { $gte: today, $lte: futureDate }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        amount: 1,
        deadlineDate: 1,
        applicantCount: 1,
        category: 1,
        daysRemaining: {
          $round: [
            { 
              $divide: [
                { $subtract: ['$deadlineDate', today] }, 
                (1000 * 60 * 60 * 24) // Convert ms to days
              ] 
            }, 
            0
          ]
        }
      }
    },
    { $sort: { daysRemaining: 1 } }
  ];
};

/**
 * Get funding statistics by month
 * 
 * @param {Number} year - Year to analyze (default: current year)
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getMonthlyFundingStats = (year = new Date().getFullYear()) => {
  return [
    {
      $match: {
        status: 'active',
        fundedCount: { $gt: 0 }
      }
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'scholarshipId',
        as: 'payments'
      }
    },
    { $unwind: '$payments' },
    {
      $match: {
        'payments.status': 'completed',
        'payments.paymentDate': {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { 
          scholarshipId: '$_id',
          month: { $month: '$payments.paymentDate' },
          year: { $year: '$payments.paymentDate' }
        },
        scholarshipTitle: { $first: '$title' },
        totalAmount: { $sum: '$payments.amount' },
        paymentsCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: { 
          month: '$_id.month',
          year: '$_id.year'
        },
        totalAmount: { $sum: '$totalAmount' },
        scholarshipCount: { $addToSet: '$_id.scholarshipId' },
        paymentsCount: { $sum: '$paymentsCount' },
        scholarships: { 
          $push: { 
            id: '$_id.scholarshipId', 
            title: '$scholarshipTitle',
            amount: '$totalAmount',
            payments: '$paymentsCount'
          } 
        }
      }
    },
    {
      $project: {
        month: '$_id.month',
        year: '$_id.year',
        totalAmount: 1,
        scholarshipCount: { $size: '$scholarshipCount' },
        paymentsCount: 1,
        averagePerScholarship: { 
          $round: [
            { 
              $divide: [
                '$totalAmount', 
                { $size: '$scholarshipCount' }
              ] 
            }, 
            2
          ] 
        },
        top3Scholarships: { $slice: ['$scholarships', 3] },
        _id: 0
      }
    },
    { $sort: { year: 1, month: 1 } }
  ];
};

/**
 * Get scholarship effectiveness by comparing application to funding rates
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getScholarshipEffectiveness = () => {
  return [
    {
      $match: {
        status: { $in: ['active', 'expired', 'closed'] },
        applicantCount: { $gt: 0 }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        amount: 1,
        category: 1,
        status: 1,
        applicantCount: 1,
        approvedCount: 1,
        fundedCount: 1,
        approvalRate: {
          $cond: [
            { $eq: ['$applicantCount', 0] },
            0,
            { 
              $multiply: [
                { $divide: ['$approvedCount', '$applicantCount'] }, 
                100
              ] 
            }
          ]
        },
        fundingRate: {
          $cond: [
            { $eq: ['$approvedCount', 0] },
            0,
            { 
              $multiply: [
                { $divide: ['$fundedCount', '$approvedCount'] }, 
                100
              ] 
            }
          ]
        },
        overallEffectiveness: {
          $cond: [
            { $eq: ['$applicantCount', 0] },
            0,
            { 
              $multiply: [
                { $divide: ['$fundedCount', '$applicantCount'] }, 
                100
              ] 
            }
          ]
        }
      }
    },
    {
      $addFields: {
        effectivenessScore: {
          $round: [
            { 
              $add: [
                { $multiply: ['$approvalRate', 0.4] },
                { $multiply: ['$fundingRate', 0.6] }
              ] 
            }, 
            1
          ]
        }
      }
    },
    { $sort: { effectivenessScore: -1 } }
  ];
};

/**
 * Get detailed statistics for a specific scholarship
 * 
 * @param {String} scholarshipId - Scholarship ID
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getScholarshipDetailedStats = (scholarshipId) => {
  const id = typeof scholarshipId === 'string' ? ObjectId(scholarshipId) : scholarshipId;
  
  return [
    {
      $match: { _id: id }
    },
    {
      $lookup: {
        from: 'users',
        let: { scholarshipId: '$_id' },
        pipeline: [
          { 
            $match: { 
              role: 'student',
              $expr: {
                $gt: [
                  { $size: {
                    $filter: {
                      input: '$scholarshipApplications',
                      as: 'app',
                      cond: { $eq: ['$$app.scholarshipId', '$$scholarshipId'] }
                    }
                  }},
                  0
                ]
              }
            }
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              institution: 1,
              program: 1,
              scholarshipApplications: {
                $filter: {
                  input: '$scholarshipApplications',
                  as: 'app',
                  cond: { $eq: ['$$app.scholarshipId', '$$scholarshipId'] }
                }
              }
            }
          }
        ],
        as: 'applicants'
      }
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'scholarshipId',
        as: 'payments'
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        amount: 1,
        status: 1,
        deadlineDate: 1,
        category: 1,
        criteria: 1,
        applicantCount: 1,
        approvedCount: 1,
        fundedCount: 1,
        applicantsInfo: {
          total: { $size: '$applicants' },
          byStatus: {
            pending: {
              $size: {
                $filter: {
                  input: '$applicants',
                  as: 'applicant',
                  cond: { $eq: [{ $arrayElemAt: ['$$applicant.scholarshipApplications.status', 0] }, 'pending'] }
                }
              }
            },
            approved: {
              $size: {
                $filter: {
                  input: '$applicants',
                  as: 'applicant',
                  cond: { $eq: [{ $arrayElemAt: ['$$applicant.scholarshipApplications.status', 0] }, 'approved'] }
                }
              }
            },
            rejected: {
              $size: {
                $filter: {
                  input: '$applicants',
                  as: 'applicant',
                  cond: { $eq: [{ $arrayElemAt: ['$$applicant.scholarshipApplications.status', 0] }, 'rejected'] }
                }
              }
            },
            funded: {
              $size: {
                $filter: {
                  input: '$applicants',
                  as: 'applicant',
                  cond: { $eq: [{ $arrayElemAt: ['$$applicant.scholarshipApplications.status', 0] }, 'funded'] }
                }
              }
            }
          }
        },
        paymentInfo: {
          total: { $size: '$payments' },
          totalAmount: { $sum: '$payments.amount' },
          completedCount: {
            $size: {
              $filter: {
                input: '$payments',
                as: 'payment',
                cond: { $eq: ['$$payment.status', 'completed'] }
              }
            }
          },
          completedAmount: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    as: 'payment',
                    cond: { $eq: ['$$payment.status', 'completed'] }
                  }
                },
                as: 'completed',
                in: '$$completed.amount'
              }
            }
          }
        }
      }
    }
  ];
}; 