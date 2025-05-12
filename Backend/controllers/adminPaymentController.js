const Payment = require('../models/Payment');
const { generateSystemReport } = require('../services/reportService');

/**
 * Get all payments/donations with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPayments = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    
    // Date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get payments with donor and scholarship details
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName organizationName donorType')
      .populate('scholarshipId', 'title');
    
    // Get total count
    const total = await Payment.countDocuments(filter);
    
    // Calculate total amount
    const totalAmount = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

/**
 * Generate system report with analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    // Validate report type
    if (!['users', 'scholarships', 'donations', 'applications', 'comprehensive'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }
    
    // Validate date range
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Generate report using the service - pass options as an object
    const report = await generateSystemReport({
      reportType,
      startDate: start, 
      endDate: end
    });
    
    return res.status(200).json({
      success: true,
      reportType,
      report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
}; 