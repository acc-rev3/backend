const Company = require('../models/Company');

// Check if email domain is allowed based on database companies
const validateCompanyDomain = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // TEMPORARY: Skip domain validation for testing
    // Find company by domain from database
    const company = await Company.findByDomain(emailDomain);

    if (!company) {
      // TEMPORARY: Allow any domain and assign to first company
      console.log('⚠️ TESTING MODE: Domain validation bypassed for email:', email);
      const allCompanies = await Company.findAll();

      if (allCompanies.length > 0) {
        // Use first company as default
        req.approvedCompany = allCompanies[0];
        console.log('⚠️ TESTING MODE: Assigned to company:', allCompanies[0].name);
        return next();
      }

      return res.status(500).json({
        success: false,
        message: 'No companies found in database'
      });
    }

    // Store the found company in request for later use
    req.approvedCompany = company;
    next();
  } catch (error) {
    console.error('Domain validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error validating email domain'
    });
  }
};

module.exports = { validateCompanyDomain };