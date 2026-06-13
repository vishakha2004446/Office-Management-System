const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// User: Upload document
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { documentType } = req.body;

        // Validate document type
        if (!['resume', 'id_proof', 'reports'].includes(documentType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        // Check file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'File size exceeds 5MB limit' });
        }

        // Create document record
        const document = await Document.create({
            user: req.user._id,
            documentType,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            filePath: req.file.path,
        });

        const populatedDoc = await document.populate('user', 'name email');

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: populatedDoc,
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload document' });
    }
};

// User: Get own documents
exports.getMyDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user._id })
            .sort({ uploadedAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
};

// User: Get specific document by type
exports.getDocumentByType = async (req, res) => {
    try {
        const { documentType } = req.params;

        const document = await Document.findOne({
            user: req.user._id,
            documentType,
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch document' });
    }
};

// User: Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from storage
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await Document.deleteOne({ _id: id });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
};

// User: Download document
exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(document.filePath, document.fileName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download document' });
    }
};

// Admin: Get all documents with filters
exports.getAllDocuments = async (req, res) => {
    try {
        const { documentType, status, userId } = req.query;
        const filter = {};

        if (documentType) filter.documentType = documentType;
        if (status) filter.status = status;
        if (userId) filter.user = userId;

        const documents = await Document.find(filter)
            .populate('user', 'name email')
            .populate('verifiedBy', 'name')
            .sort({ uploadedAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
};

// Admin: Verify/Reject document
exports.verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComment } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const document = await Document.findByIdAndUpdate(
            id,
            {
                status,
                adminComment,
                verifiedBy: req.user._id,
                verifiedAt: new Date(),
            },
            { new: true }
        )
            .populate('user', 'name email')
            .populate('verifiedBy', 'name');

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json({
            message: `Document ${status} successfully`,
            document,
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Failed to verify document' });
    }
};

// Admin: Get document stats
exports.getDocumentStats = async (req, res) => {
    try {
        const stats = {
            total: await Document.countDocuments(),
            pending: await Document.countDocuments({ status: 'pending' }),
            verified: await Document.countDocuments({ status: 'verified' }),
            rejected: await Document.countDocuments({ status: 'rejected' }),
            byType: {
                resume: await Document.countDocuments({ documentType: 'resume' }),
                id_proof: await Document.countDocuments({ documentType: 'id_proof' }),
                reports: await Document.countDocuments({ documentType: 'reports' }),
            },
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch document stats' });
    }
};
