const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Scholarship = require('../models/Scholarship');
const Payment = require('../models/Payment');

/**
 * Generate a comprehensive system report
 * 
 * @param {Object} options - Report options
 * @param {String} options.reportType - Type of report: 'users', 'scholarships', 'donations', 'applications', or 'comprehensive'
 * @param {Date} options.startDate - Start date for report period
 * @param {Date} options.endDate - End date for report period
 * @returns {Object} The generated report
 */
exports.generateSystemReport = async (options = {}) => {
  const { reportType = 'comprehensive', startDate, endDate } = options;
  
  // Set default date range if not provided (last month)
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();
  
  // Generate specific report types based on reportType parameter
  if (reportType === 'users') {
    const userStats = await generateUserReport(start, end);
    return {
      generatedAt: new Date(),
      period: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalUsers: userStats.summary.totalUsers,
        newUsersInPeriod: userStats.summary.newUsersInPeriod,
      },
      users: userStats
    };
  } 
  else if (reportType === 'scholarships') {
    const scholarshipStats = await generateScholarshipReport(start, end);
    return {
      generatedAt: new Date(),
      period: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalScholarships: scholarshipStats.summary.totalScholarships,
      },
      scholarships: scholarshipStats
    };
  }
  else if (reportType === 'donations') {
    const donationStats = await generateDonationReport(start, end);
    return {
      generatedAt: new Date(),
      period: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalDonations: donationStats.summary.totalDonations,
        totalDonationAmount: donationStats.summary.totalAmount
      },
      donations: donationStats
    };
  }
  else if (reportType === 'applications') {
    const applicationStats = await generateApplicationReport(start, end);
    return {
      generatedAt: new Date(),
      period: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalApplications: applicationStats.summary.totalApplications,
      },
      applications: applicationStats
    };
  }
  
  // Default: comprehensive report
  // Generate report
  const [
    userStats,
    scholarshipStats,
    donationStats,
    applicationStats
  ] = await Promise.all([
    generateUserReport(start, end),
    generateScholarshipReport(start, end),
    generateDonationReport(start, end),
    generateApplicationReport(start, end)
  ]);
  
  // Combine reports into a comprehensive report
  return {
    generatedAt: new Date(),
    period: {
      startDate: start,
      endDate: end
    },
    summary: {
      totalUsers: userStats.summary.totalUsers,
      totalScholarships: scholarshipStats.summary.totalScholarships,
      totalDonations: donationStats.summary.totalDonations,
      totalApplications: applicationStats.summary.totalApplications,
      totalDonationAmount: donationStats.summary.totalAmount
    },
    users: userStats,
    scholarships: scholarshipStats,
    donations: donationStats,
    applications: applicationStats
  };
};

/**
 * Generate a user report
 * 
 * @param {Date} startDate - Start date for report period
 * @param {Date} endDate - End date for report period
 * @returns {Object} The user report
 */
const generateUserReport = async (startDate, endDate) => {
  // Get user counts by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verified: {
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        role: '$_id',
        count: 1,
        active: 1,
        verified: 1,
        _id: 0
      }
    }
  ]);
  
  // Get new users in period
  const newUsers = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        role: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Get monthly user growth
  const monthlyGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          role: '$role'
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        role: '$_id.role',
        count: 1,
        _id: 0
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
  
  // Format monthly growth data
  const formattedMonthlyGrowth = [];
  
  // Group by year-month
  const groupedByMonth = {};
  
  monthlyGrowth.forEach(item => {
    const key = `${item.year}-${item.month}`;
    
    if (!groupedByMonth[key]) {
      groupedByMonth[key] = {
        year: item.year,
        month: item.month,
        student: 0,
        donor: 0,
        admin: 0,
        total: 0
      };
    }
    
    groupedByMonth[key][item.role] += item.count;
    groupedByMonth[key].total += item.count;
  });
  
  // Convert to array and sort
  Object.values(groupedByMonth).forEach(item => {
    formattedMonthlyGrowth.push(item);
  });
  
  formattedMonthlyGrowth.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  
  // Calculate totals
  const totalUsers = usersByRole.reduce((sum, role) => sum + role.count, 0);
  const totalNewUsers = newUsers.reduce((sum, role) => sum + role.count, 0);
  
  return {
    summary: {
      totalUsers,
      newUsersInPeriod: totalNewUsers,
      usersByRole,
      newUsers
    },
    details: {
      monthlyGrowth: formattedMonthlyGrowth
    }
  };
};

/**
 * Generate a scholarship report
 * 
 * @param {Date} startDate - Start date for report period
 * @param {Date} endDate - End date for report period
 * @returns {Object} The scholarship report
 */
const generateScholarshipReport = async (startDate, endDate) => {
  // Get scholarship counts by status
  const scholarshipsByStatus = await Scholarship.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    }
  ]);
  
  // Get new scholarships in period
  const newScholarships = await Scholarship.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    }
  ]);
  
  // Get scholarships by category
  const scholarshipsByCategory = await Scholarship.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Get upcoming deadlines
  const upcomingDeadlines = await Scholarship.find({
    status: 'active',
    deadlineDate: { $gt: new Date() }
  })
    .sort({ deadlineDate: 1 })
    .limit(10)
    .select('title amount deadlineDate');
  
  // Calculate totals
  const totalScholarships = scholarshipsByStatus.reduce((sum, status) => sum + status.count, 0);
  const totalAmount = scholarshipsByStatus.reduce((sum, status) => sum + status.totalAmount, 0);
  const totalNewScholarships = newScholarships.reduce((sum, status) => sum + status.count, 0);
  
  return {
    summary: {
      totalScholarships,
      totalAmount,
      newScholarshipsInPeriod: totalNewScholarships,
      scholarshipsByStatus,
      scholarshipsByCategory
    },
    details: {
      upcomingDeadlines
    }
  };
};

/**
 * Generate a donation report
 * 
 * @param {Date} startDate - Start date for report period
 * @param {Date} endDate - End date for report period
 * @returns {Object} The donation report
 */
const generateDonationReport = async (startDate, endDate) => {
  // Get donation counts by status
  const donationsByStatus = await Payment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    }
  ]);
  
  // Get donations in period
  const donationsInPeriod = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    }
  ]);
  
  // Get donations by payment method
  const donationsByMethod = await Payment.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        method: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  // Get monthly donation trends
  const monthlyTrends = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
  
  // Get top donors
  const topDonors = await Donor.aggregate([
    { $sort: { totalDonated: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        organizationName: 1,
        donorType: 1,
        totalDonated: 1,
        donationCount: { $size: '$donationHistory' }
      }
    }
  ]);
  
  // Calculate totals
  const totalDonations = donationsByStatus.reduce((sum, status) => sum + status.count, 0);
  const totalAmount = donationsByStatus.reduce((sum, status) => sum + status.totalAmount, 0);
  const totalDonationsInPeriod = donationsInPeriod.reduce((sum, status) => sum + status.count, 0);
  const totalAmountInPeriod = donationsInPeriod.reduce((sum, status) => sum + status.totalAmount, 0);
  
  return {
    summary: {
      totalDonations,
      totalAmount,
      donationsInPeriod: totalDonationsInPeriod,
      amountInPeriod: totalAmountInPeriod,
      donationsByStatus,
      donationsByMethod
    },
    details: {
      monthlyTrends,
      topDonors
    }
  };
};

/**
 * Generate an application report
 * 
 * @param {Date} startDate - Start date for report period
 * @param {Date} endDate - End date for report period
 * @returns {Object} The application report
 */
const generateApplicationReport = async (startDate, endDate) => {
  // Get application counts by status
  const applicationsByStatus = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $group: {
        _id: '$scholarshipApplications.status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Get applications in period
  const applicationsInPeriod = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.appliedAt': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$scholarshipApplications.status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Get top institutions by applications
  const topInstitutions = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $group: {
        _id: '$institution',
        count: { $sum: 1 },
        uniqueStudents: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        institution: '$_id',
        count: 1,
        studentCount: { $size: '$uniqueStudents' },
        _id: 0
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Get monthly application trends
  const monthlyTrends = await Student.aggregate([
    { $unwind: '$scholarshipApplications' },
    {
      $match: {
        'scholarshipApplications.appliedAt': { 
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$scholarshipApplications.appliedAt' },
          month: { $month: '$scholarshipApplications.appliedAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
        _id: 0
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
  
  // Calculate totals
  const totalApplications = applicationsByStatus.reduce((sum, status) => sum + status.count, 0);
  const totalApplicationsInPeriod = applicationsInPeriod.reduce((sum, status) => sum + status.count, 0);
  
  return {
    summary: {
      totalApplications,
      applicationsInPeriod: totalApplicationsInPeriod,
      applicationsByStatus
    },
    details: {
      topInstitutions,
      monthlyTrends
    }
  };
};
