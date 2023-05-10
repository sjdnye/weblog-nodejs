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

// @desc  Dashboard Edit POST
// @route GET /dashboard/edit-post/:id
router.get("/edit-post/:id",authenticated, adminController.getEditPost);

// @desc  Dashboard DELETE POST
// @route GET /dashboard/delete-post/:id
router.get("/delete-post/:id",authenticated, adminController.getDeletePost);

// @desc  Dashboard Handle Add Post
// @route POST /dashboard/add-post
router.post("/add-post", authenticated, adminController.handleAddpost);



// @desc  Dashboard Handle Upload Image
// @route POST /dashboard/image-upload
router.post("/image-upload",authenticated, adminController.handleUploadImage);

// @desc  Dashboard Edit POST
// @route POST /dashboard/edit-post/:id
router.post("/edit-post/:id",authenticated, adminController.handleEditPost);

// @desc  Dashboard Search POST
// @route POST /dashboard/search
router.post("/search", authenticated, adminController.handleDashboardSearch)


module.exports = router;