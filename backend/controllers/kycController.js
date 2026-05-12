const User = require('../models/User');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed. Max size: 5MB'));
    }
  }
});

// @desc    Upload KYC document
// @route   POST /api/kyc/upload
// @access  Private
exports.uploadDocument = upload.single('document');

// @desc    Submit KYC documents
// @route   POST /api/kyc/submit
// @access  Private
exports.submitKYC = async (req, res) => {
  try {
    const userId = req.user._id;
    const { documentType } = req.body;

    console.log('KYC Upload Request:', { userId, documentType, file: req.file ? req.file.originalname : 'No file' });

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload a document'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check for duplicate document
    if (user.kycDocuments && user.kycDocuments.length > 0) {
      const existingDoc = user.kycDocuments.find(doc => 
        doc.type === documentType
      );
      
      if (existingDoc) {
        console.log('Duplicate document detected:', documentType);
        
        // Delete the uploaded file since it's a duplicate
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('Deleted duplicate file:', req.file.path);
        }
        
        return res.status(400).json({
          success: false,
          message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} card already uploaded. Please delete the existing document first or choose a different document type.`,
          isDuplicate: true,
          existingDocument: {
            type: existingDoc.type,
            filename: existingDoc.filename,
            uploadedAt: existingDoc.uploadedAt
          }
        });
      }
    }
    
    // Add document with detailed metadata
    if (!user.kycDocuments) {
      user.kycDocuments = [];
    }
    
    const documentData = {
      type: documentType || 'unknown',
      path: req.file.path,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: Date.now()
    };
    
    user.kycDocuments.push(documentData);
    user.kycStatus = 'pending';
    await user.save();

    console.log('KYC Document uploaded successfully:', {
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });

    // Create notification
    await Notification.create({
      user: userId,
      message: `KYC document (${documentType}) submitted for verification`,
      type: 'kyc'
    });

    res.json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: {
        document: documentData,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('KYC Upload Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
};

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getKYCStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        kycStatus: user.kycStatus,
        documents: user.kycDocuments || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
