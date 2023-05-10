const { Router} = require('express');

const postController = require('../controllers/postControllers');

const router = new Router();


// @desc Show Post Details
// @route GET /post/:id
router.get("/:id", postController.showPost)




module.exports = router;