const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");
const { truncate } = require('../utils/helpers');

exports.getIndex = async (req, res) => {
    try {
        const page = +req.query.page || 1; 
        const postPerPage = 5;

        const numberOfPost = await Blog.find({status: "public"}).countDocuments();

        const posts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage)

        res.render("index", {
            pageTitle: "وبلاگ",
            path: "/",
            posts,
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPrevPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500");
    }
};