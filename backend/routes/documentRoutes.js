// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const {
//     uploadDocument,
//     getMyDocuments,
//     getDocumentByType,
//     deleteDocument,
//     downloadDocument,
//     getAllDocuments,
//     verifyDocument,
//     getDocumentStats,
// } = require('../controllers/documentController');

// const { protect } = require('../middleware/authMiddleware');
// const { isAdmin } = require('../middleware/roleMiddleware');

// // Multer configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../uploads'));
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     },
// });

// const upload = multer({
//     storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//     fileFilter: (req, file, cb) => {
//         // Allow PDF, DOC, DOCX, JPG, PNG
//         const allowedMimes = [
//             'application/pdf',
//             'application/msword',
//             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//             'image/jpeg',
//             'image/png',
//         ];

//         if (allowedMimes.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.'));
//         }
//     },
// });

// // User routes
// router.post('/', protect, upload.single('file'), uploadDocument);
// router.get('/my', protect, getMyDocuments);
// router.get('/type/:documentType', protect, getDocumentByType);
// router.delete('/:id', protect, deleteDocument);
// router.get('/download/:id', protect, downloadDocument);

// // Admin routes
// router.get('/admin/all', protect, isAdmin, getAllDocuments);
// router.get('/admin/stats', protect, isAdmin, getDocumentStats);
// router.put('/admin/verify/:id', protect, isAdmin, verifyDocument);

// module.exports = router;
