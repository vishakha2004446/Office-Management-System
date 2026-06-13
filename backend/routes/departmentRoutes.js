const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment,
    deleteDepartment,
    assignDepartment,
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.get('/',           protect, getDepartments);               // all users can fetch list
router.post('/',          protect, isAdmin, createDepartment);
router.delete('/:id',     protect, isAdmin, deleteDepartment);
router.put('/assign',     protect, isAdmin, assignDepartment);

module.exports = router;
