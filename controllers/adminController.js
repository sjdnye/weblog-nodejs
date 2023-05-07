const Blog = require('../models/Blog');
const {formatDate}  = require('../utils/jalali');
 const {get500} = require('./errorController');


exports.getDashboard = async(req, res) => {
    try {
        const blogs = await Blog.find({ user: req.user.id })

        res.render("private/blogs", {
            pageTitle: "بخش مدیریت | داشبورد",
            path: "/dashboard",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            blogs: blogs,
            formatDate: formatDate
        })

    } catch (err) {
     get500(req, res);
    }


}

exports.getAddPost = (req, res) => {
    res.render("private/addPost", {
        pageTitle: "بخش مدیریت | ساخت پست جدید",
        path: "/dashboard/add-post",
        layout: "./layouts/dashLayout",
        fullname: req.user.fullname
    })
}

exports.handleAddpost = async(req, res) => {
    try {
        // const { title, body, status } = req.body
        // await Blog.create({
        //     title,
        //     body,
        //     status
        // })
        await Blog.create({...req.body, user: req.user.id })

        res.redirect("/dashboard")
    } catch (err) {
       get500(req, res);
    }
}