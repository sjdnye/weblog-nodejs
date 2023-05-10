const Blog = require('../models/Blog');
const {formatDate} = require('../utils/jalali');
const {get500} = require('./errorController');


exports.showPost = async(req, res) => {
    try {
        const postId = req.params.id;
        const post = await Blog.findOne({_id : postId}).populate("user");
        if(!post || post == null){
            return res.redirect("/400");
        }
        res.render("postDetail",{
            pageTitle: post.title,
            path: "/post",
            post,
            formatDate
        });
        
    } catch (err) {
        console.log(err);
        get500(req, res);
    }

}