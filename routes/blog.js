const { Router } = require('express');

const blogController = require('../controllers/blogController');

const router = new Router();


// @desc  Weblog Index Page
// @route GET /
router.get("/",blogController.getIndex);

// @desc  Contact Page
// @route GET /contact
router.get("/contact",blogController.getContactPage);

// @desc  Weblog Numeric Captcha
// @route get /captcha.png
router.get("/captcha.png",blogController.getCaptcha);

// @desc  Handle Contact Page
// @route POST /contact
router.post("/contact",blogController.handleContactPage);





module.exports = router
