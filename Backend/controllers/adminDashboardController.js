const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Scholarship = require('../models/Scholarship');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

/**
 * Get admin dashboard data with analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get admin profile
    const admin = await Admin.findOne({ userId });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    // Get quick stats
    const [
      totalStudents,
      totalDonors,
      totalScholarships,
      pendingApplicationsCount,
      approvedApplications,
      rejectedApplications,
      pendingDonorScholarships,
      totalDonations
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'donor', isActive: true }),
      Scholarship.countDocuments(),
      // Get applications by status using aggregation
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'pending' } },
        { $count: 'count' }
      ]),
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'approved' } },
        { $count: 'count' }
      ]),
      Student.aggregate([
        { $unwind: '$scholarshipApplications' },
        { $match: { 'scholarshipApplications.status': 'rejected' } },
        { $count: 'count' }
      ]),
      // Get pending donor scholarships
      Scholarship.countDocuments({ status: 'pending_approval' }),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Extract counts from aggregation results
    const stats = {
      totalStudents,
      totalDonors,
      totalScholarships,
      pendingApplicationsCount: pendingApplicationsCount.length > 0 ? pendingApplicationsCount[0].count : 0,
      approvedApplicationsCount: approvedApplications.length > 0 ? approvedApplications[0].count : 0,
      rejectedApplicationsCount: rejectedApplications.length > 0 ? rejectedApplications[0].count : 0,
      pendingDonorScholarships,
      totalDonationsAmount: totalDonations.length > 0 ? totalDonations[0].total : 0
    };
    
    // Get monthly user growth data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Get student registrations by month
    const studentGrowth = await User.aggregate([
      {
        $match: {
          role: 'student',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get donor registrations by month
    const donorGrowth = await User.aggregate([
      {
        $match: {
          role: 'donor',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get application status distribution for pie chart
    const applicationStatusDistribution = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      {
        $group: {
          _id: '$scholarshipApplications.status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Prepare growth chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize the data for the current month and 5 previous months
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const growthChartData = [];
    for (let i = 5; i >= 0; i--) {
      let monthIndex = currentMonth - i;
      let year = currentYear;
      
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
      
      growthChartData.push({
        month: `${months[monthIndex]} ${year}`,
        students: 0,
        donors: 0
      });
    }
    
    // Fill in student data
    studentGrowth.forEach(item => {
      const monthIndex = item._id.month - 1;
      const year = item._id.year;
      const monthLabel = `${months[monthIndex]} ${year}`;
      
      const existingEntry = growthChartData.find(entry => entry.month === monthLabel);
      if (existingEntry) {
        existingEntry.students = item.count;
      }
    });
    
    // Fill in donor data
    donorGrowth.forEach(item => {
      const monthIndex = item._id.month - 1;
      const year = item._id.year;
      const monthLabel = `${months[monthIndex]} ${year}`;
      
      const existingEntry = growthChartData.find(entry => entry.month === monthLabel);
      if (existingEntry) {
        existingEntry.donors = item.count;
      }
    });
    
    // Make sure ApplicationStatusData has actual counts
    const applicationStatusData = applicationStatusDistribution.length > 0 ? 
      applicationStatusDistribution.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count
      })) : 
      [
        { name: 'Pending', value: pendingApplicationsCount.length > 0 ? pendingApplicationsCount[0].count : 0 },
        { name: 'Approved', value: approvedApplications.length > 0 ? approvedApplications[0].count : 0 },
        { name: 'Rejected', value: rejectedApplications.length > 0 ? rejectedApplications[0].count : 0 }
      ];

    // Get ALL donor scholarships (not just pending ones)
    const donorScholarships = await Scholarship.find({
      $or: [
        { status: 'pending_approval' },
        { status: 'active' },
        { status: 'rejected' }
      ]
    })
    .populate('createdBy', 'firstName lastName email organizationName role')
    .sort({ createdAt: -1 })
    .limit(10);

    // Filter to only include donor-created scholarships
    const formattedDonorScholarships = donorScholarships
      .filter(scholarship => 
        scholarship.createdBy && scholarship.createdBy.role === 'donor'
      )
      .map(scholarship => ({
        _id: scholarship._id,
        title: scholarship.title,
        amount: scholarship.amount,
        description: scholarship.description,
        deadlineDate: scholarship.deadlineDate,
        category: scholarship.category,
        status: scholarship.status,
        createdBy: scholarship.createdBy ? {
          _id: scholarship.createdBy._id,
          name: scholarship.createdBy.firstName + ' ' + scholarship.createdBy.lastName,
          email: scholarship.createdBy.email,
          organizationName: scholarship.createdBy.organizationName,
          role: scholarship.createdBy.role
        } : 'Unknown',
        createdAt: scholarship.createdAt
      }));

    // Get recent applications with ALL statuses, prioritizing pending applications first
    const pendingApplications = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications.status': 'pending' } },
      { $sort: { 'scholarshipApplications.appliedAt': -1 } },
      { $limit: 5 }, // Get up to 5 pending applications
      {
        $lookup: {
          from: 'scholarships',
          localField: 'scholarshipApplications.scholarshipId',
          foreignField: '_id',
          as: 'scholarship'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          institution: 1,
          program: 1,
          applicationId: '$scholarshipApplications._id',
          applicationDate: '$scholarshipApplications.appliedAt',
          scholarshipId: { $arrayElemAt: ['$scholarship._id', 0] },
          scholarshipTitle: { $arrayElemAt: ['$scholarship.title', 0] },
          scholarshipAmount: { $arrayElemAt: ['$scholarship.amount', 0] },
          status: '$scholarshipApplications.status',
          reviewedAt: '$scholarshipApplications.reviewedAt',
          reviewedBy: '$scholarshipApplications.reviewedBy'
        }
      }
    ]);

    // Get approved/rejected applications (non-pending)
    const otherApplications = await Student.aggregate([
      { $unwind: '$scholarshipApplications' },
      { $match: { 'scholarshipApplications.status': { $in: ['approved', 'rejected', 'funded'] } } },
      { $sort: { 'scholarshipApplications.appliedAt': -1 } },
      { $limit: 10 }, // Get up to 10 other applications
      {
        $lookup: {
          from: 'scholarships',
          localField: 'scholarshipApplications.scholarshipId',
          foreignField: '_id',
          as: 'scholarship'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          institution: 1,
          program: 1,
          applicationId: '$scholarshipApplications._id',
          applicationDate: '$scholarshipApplications.appliedAt',
          scholarshipId: { $arrayElemAt: ['$scholarship._id', 0] },
          scholarshipTitle: { $arrayElemAt: ['$scholarship.title', 0] },
          scholarshipAmount: { $arrayElemAt: ['$scholarship.amount', 0] },
          status: '$scholarshipApplications.status',
          reviewedAt: '$scholarshipApplications.reviewedAt',
          reviewedBy: '$scholarshipApplications.reviewedBy'
        }
      }
    ]);

    // Combine pending and other applications, limiting to 10 total
    // Prioritize showing all pending applications first
    let recentApplications = [...pendingApplications];
    
    // Add other applications until we reach 10 total
    const remainingSlots = 10 - recentApplications.length;
    if (remainingSlots > 0 && otherApplications.length > 0) {
      recentApplications = [...recentApplications, ...otherApplications.slice(0, remainingSlots)];
    }
    
    // Debug log to verify what statuses are being returned
    console.log('Application statuses:', recentApplications.map(app => app.status));
    
    return res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      },
      stats: {
        totalStudents,
        totalDonors, 
        totalScholarships,
        pendingApplicationsCount: pendingApplicationsCount.length > 0 ? pendingApplicationsCount[0].count : 0,
        approvedApplicationsCount: approvedApplications.length > 0 ? approvedApplications[0].count : 0,
        rejectedApplicationsCount: rejectedApplications.length > 0 ? rejectedApplications[0].count : 0,
        pendingDonorScholarships,
        totalDonationsAmount: totalDonations.length > 0 ? totalDonations[0].total : 0
      },
      growthChartData,
      applicationStatusData,
      recentApplications,
      donorScholarships: formattedDonorScholarships
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
}; 