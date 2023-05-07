const { Router } = require('express');
const { authenticated } = require('../middlewares/auth');

const router = new Router();
const adminController = require('../controllers/adminController');


// @desc Dashboard
// @route GET /dashboard
router.get("/", authenticated, adminController.getDashboard)

// @desc  Add Post
// @route GET /dashboard/add-post
router.get("/add-post", authenticated, adminController.getAddPost)


// @desc  Dashboard Handle Add Post
// @route POST /dashboard/add-post
router.post("/add-post", authenticated, adminController.handleAddpost)



module.exports = router;