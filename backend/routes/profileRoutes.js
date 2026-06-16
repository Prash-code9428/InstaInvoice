const express = require('express');
const router = express.Router();
const EnterpriseProfile = require('../models/profileModel');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/profile
 * @desc    Fetch the active enterprise profile config for current user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await EnterpriseProfile.findOne({ userId: req.user });
    if (!profile) {
      return res.status(200).json(null);
    }
    return res.status(200).json({
      _id: profile._id,
      userId: profile.userId,
      name: profile.name,
      address: profile.address,
      contactNumber: profile.contactNumber,
      registrationType: profile.registrationType,
      gstin: profile.gstin,
      logoUrl: profile.logoUrl,
      signatureUrl: profile.signatureUrl,
      upiId: profile.upiId,
      preferredPaymentMethod: profile.preferredPaymentMethod,
      bankName: profile.bankName,
      branchName: profile.branchName,
      accountNumber: profile.accountNumber,
      ifscCode: profile.ifscCode
    });
  } catch (error) {
    console.error(`Error fetching profile: ${error.message}`);
    return res.status(500).json({ error: 'Server error while fetching profile configuration' });
  }
});

/**
 * @route   POST /api/profile
 * @desc    Create or update (upsert) the enterprise profile for current user
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, address, contactNumber, registrationType, gstin, logoUrl, bankName, accountNumber, ifscCode, signatureUrl, branchName, upiId, preferredPaymentMethod } = req.body;

  try {
    let profile = await EnterpriseProfile.findOne({ userId: req.user });

    if (profile) {
      // Update existing profile configuration using aliases
      profile.name = name;
      profile.address = address;
      profile.contactNumber = contactNumber;
      profile.registrationType = registrationType;
      profile.gstin = gstin;
      profile.logoUrl = logoUrl;
      profile.bankName = bankName;
      profile.accountNumber = accountNumber;
      profile.ifscCode = ifscCode;
      profile.signatureUrl = signatureUrl;
      profile.branchName = branchName;
      profile.upiId = upiId;
      profile.preferredPaymentMethod = preferredPaymentMethod;

      const updatedProfile = await profile.save();
      return res.status(200).json({
        _id: updatedProfile._id,
        userId: updatedProfile.userId,
        name: updatedProfile.name,
        address: updatedProfile.address,
        contactNumber: updatedProfile.contactNumber,
        registrationType: updatedProfile.registrationType,
        gstin: updatedProfile.gstin,
        logoUrl: updatedProfile.logoUrl,
        signatureUrl: updatedProfile.signatureUrl,
        upiId: updatedProfile.upiId,
        preferredPaymentMethod: updatedProfile.preferredPaymentMethod,
        bankName: updatedProfile.bankName,
        branchName: updatedProfile.branchName,
        accountNumber: updatedProfile.accountNumber,
        ifscCode: updatedProfile.ifscCode
      });
    }

    // Create new profile using aliases if none exists
    const newProfile = new EnterpriseProfile({
      userId: req.user,
      name,
      address,
      contactNumber,
      registrationType,
      gstin,
      logoUrl,
      bankName,
      accountNumber,
      ifscCode,
      signatureUrl,
      branchName,
      upiId,
      preferredPaymentMethod
    });

    const savedProfile = await newProfile.save();
    return res.status(201).json({
      _id: savedProfile._id,
      userId: savedProfile.userId,
      name: savedProfile.name,
      address: savedProfile.address,
      contactNumber: savedProfile.contactNumber,
      registrationType: savedProfile.registrationType,
      gstin: savedProfile.gstin,
      logoUrl: savedProfile.logoUrl,
      signatureUrl: savedProfile.signatureUrl,
      upiId: savedProfile.upiId,
      preferredPaymentMethod: savedProfile.preferredPaymentMethod,
      bankName: savedProfile.bankName,
      branchName: savedProfile.branchName,
      accountNumber: savedProfile.accountNumber,
      ifscCode: savedProfile.ifscCode
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    console.error(`Error saving profile: ${error.message}`);
    return res.status(500).json({ error: 'Server error while saving profile configuration' });
  }
});

module.exports = router;
