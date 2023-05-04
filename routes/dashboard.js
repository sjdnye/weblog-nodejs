const { Router } = require('express');

const router = new Router();


// @desc Login Page
// @route GET /dashboard/login
router.get("/login", (req, res) => {
    res.render("login", {
        pageTitle: "صفحه ورود",
        path: "/login"
    })
})

// @desc Dashboard
// @route GET /dashboard
router.get("/", (req, res) => {
    res.render("dashboard", {
        pageTitle: "بخش مدیریت | داشبورد",
        path: "/dashboard",
        layout: "./layouts/dashLayout"

    })
})


module.exports = router;