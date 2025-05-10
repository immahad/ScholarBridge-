const mongoose = require('mongoose');

/**
 * MongoDB aggregation pipelines for application data analysis
 */

/**
 * Get application statistics by status
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getApplicationStatsByStatus = () => {
  return [
    { $unwind: '$scholarshipApplications' },
    { 
      $group: {
        _id: '$scholarshipApplications.status',
        count: { $sum: 1 },
        applications: {
          $push: {
            applicationId: '$scholarshipApplications._id',
            scholarshipId: '$scholarshipApplications.scholarshipId',
            studentId: '$_id',
            appliedAt: '$scholarshipApplications.appliedAt'
          }
        }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        recentApplications: { $slice: ['$applications', 5] },
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ];
};

/**
 * Get application trend by date
 * 
 * @param {Date} startDate - Start date for analysis
 * @param {Date} endDate - End date for analysis
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getApplicationTrendByDate = (startDate, endDate) => {
  const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 6));
  const end = endDate || new Date();
  
  return [
    { $unwind: '$scholarshipApplications' },
    { 
      $match: {
        'scholarshipApplications.appliedAt': { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$scholarshipApplications.appliedAt' },
          month: { $month: '$scholarshipApplications.appliedAt' },
          day: { $dayOfMonth: '$scholarshipApplications.appliedAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ];
};

/**
 * Get application statistics by institution
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getApplicationStatsByInstitution = () => {
  return [
    { $unwind: '$scholarshipApplications' },
    {
      $group: {
        _id: {
          institution: '$institution',
          status: '$scholarshipApplications.status'
        },
        count: { $sum: 1 },
        students: { $addToSet: '$_id' }
      }
    },
    {
      $group: {
        _id: '$_id.institution',
        totalApplications: { $sum: '$count' },
        uniqueStudents: { $sum: { $size: '$students' } },
        statusBreakdown: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        }
      }
    },
    {
      $project: {
        institution: '$_id',
        totalApplications: 1,
        uniqueStudents: 1,
        statusBreakdown: 1,
        avgApplicationsPerStudent: { 
          $round: [
            { $divide: ['$totalApplications', '$uniqueStudents'] }, 
            1
          ] 
        },
        _id: 0
      }
    },
    { $sort: { totalApplications: -1 } }
  ];
};

/**
 * Get detailed application statistics for a specific scholarship
 * 
 * @param {String} scholarshipId - Scholarship ID to analyze
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getApplicationStatsForScholarship = (scholarshipId) => {
  const id = typeof scholarshipId === 'string' ? 
    mongoose.Types.ObjectId(scholarshipId) : scholarshipId;
  
  return [
    { $unwind: '$scholarshipApplications' },
    { 
      $match: { 
        'scholarshipApplications.scholarshipId': id
      }
    },
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarship'
      }
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        institution: 1,
        program: 1,
        currentGPA: 1,
        applicationId: '$scholarshipApplications._id',
        status: '$scholarshipApplications.status',
        appliedAt: '$scholarshipApplications.appliedAt',
        reviewedAt: '$scholarshipApplications.reviewedAt',
        reviewedBy: '$scholarshipApplications.reviewedBy',
        fundedAt: '$scholarshipApplications.fundedAt',
        fundedBy: '$scholarshipApplications.fundedBy',
        comments: '$scholarshipApplications.comments',
        scholarship: { $arrayElemAt: ['$scholarship', 0] }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        applications: { $push: '$$ROOT' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        applications: 1,
        _id: 0
      }
    }
  ];
};

/**
 * Get conversion rates for applications
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getApplicationConversionRates = () => {
  return [
    {
      $lookup: {
        from: 'scholarships',
        localField: 'scholarshipApplications.scholarshipId',
        foreignField: '_id',
        as: 'scholarships'
      }
    },
    { $unwind: '$scholarships' },
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.scholarshipId': '$scholarships._id'
      }
    },
    {
      $group: {
        _id: '$scholarships._id',
        scholarshipTitle: { $first: '$scholarships.title' },
        total: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$scholarshipApplications.status', 'pending'] }, 1, 0]
          }
        },
        approved: {
          $sum: {
            $cond: [{ $eq: ['$scholarshipApplications.status', 'approved'] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$scholarshipApplications.status', 'rejected'] }, 1, 0]
          }
        },
        funded: {
          $sum: {
            $cond: [{ $eq: ['$scholarshipApplications.status', 'funded'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        scholarshipTitle: 1,
        total: 1,
        pending: 1,
        approved: 1,
        rejected: 1,
        funded: 1,
        approvalRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { 
              $multiply: [
                { $divide: ['$approved', { $subtract: ['$total', '$pending'] }] },
                100
              ] 
            }
          ]
        },
        fundingRate: {
          $cond: [
            { $eq: ['$approved', 0] },
            0,
            { 
              $multiply: [
                { $divide: ['$funded', '$approved'] },
                100
              ] 
            }
          ]
        },
        overallConversion: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { 
              $multiply: [
                { $divide: ['$funded', '$total'] },
                100
              ] 
            }
          ]
        }
      }
    },
    {
      $addFields: {
        approvalRate: { $round: ['$approvalRate', 1] },
        fundingRate: { $round: ['$fundingRate', 1] },
        overallConversion: { $round: ['$overallConversion', 1] }
      }
    },
    { $sort: { overallConversion: -1 } }
  ];
};

/**
 * Get application processing time statistics
 * 
 * @returns {Array} - MongoDB aggregation pipeline
 */
exports.getApplicationProcessingTime = () => {
  return [
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.reviewedAt': { $exists: true }
      }
    },
    {
      $project: {
        _id: 1,
        status: '$scholarshipApplications.status',
        scholarshipId: '$scholarshipApplications.scholarshipId',
        appliedAt: '$scholarshipApplications.appliedAt',
        reviewedAt: '$scholarshipApplications.reviewedAt',
        fundedAt: '$scholarshipApplications.fundedAt',
        processingTimeInDays: {
          $divide: [
            { $subtract: ['$scholarshipApplications.reviewedAt', '$scholarshipApplications.appliedAt'] },
            (1000 * 60 * 60 * 24) // Convert ms to days
          ]
        },
        fundingTimeInDays: {
          $cond: [
            { $eq: ['$scholarshipApplications.status', 'funded'] },
            {
              $divide: [
                { $subtract: ['$scholarshipApplications.fundedAt', '$scholarshipApplications.reviewedAt'] },
                (1000 * 60 * 60 * 24) // Convert ms to days
              ]
            },
            null
          ]
        },
        totalTimeInDays: {
          $cond: [
            { $eq: ['$scholarshipApplications.status', 'funded'] },
            {
              $divide: [
                { $subtract: ['$scholarshipApplications.fundedAt', '$scholarshipApplications.appliedAt'] },
                (1000 * 60 * 60 * 24) // Convert ms to days
              ]
            },
            null
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgProcessingTime: { $avg: '$processingTimeInDays' },
        minProcessingTime: { $min: '$processingTimeInDays' },
        maxProcessingTime: { $max: '$processingTimeInDays' },
        avgFundingTime: { $avg: '$fundingTimeInDays' },
        minFundingTime: { $min: '$fundingTimeInDays' },
        maxFundingTime: { $max: '$fundingTimeInDays' },
        avgTotalTime: { $avg: '$totalTimeInDays' },
        minTotalTime: { $min: '$totalTimeInDays' },
        maxTotalTime: { $max: '$totalTimeInDays' },
        applicationCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        processingTime: {
          avg: { $round: ['$avgProcessingTime', 1] },
          min: { $round: ['$minProcessingTime', 1] },
          max: { $round: ['$maxProcessingTime', 1] }
        },
        fundingTime: {
          avg: { $round: ['$avgFundingTime', 1] },
          min: { $round: ['$minFundingTime', 1] },
          max: { $round: ['$maxFundingTime', 1] }
        },
        totalTime: {
          avg: { $round: ['$avgTotalTime', 1] },
          min: { $round: ['$minTotalTime', 1] },
          max: { $round: ['$maxTotalTime', 1] }
        },
        applicationCount: 1
      }
    }
  ];
}; 