const Blog = require('../models/Blog');
const {formatDate} = require('../utils/jalali');


exports.showPost = async(req, res) => {
    try {
        const postId = req.params.id;
        const post = await Blog.findOne({_id : postId}).populate("user");
        if(!post || post == null){
            return res.redirect("errors/400");
        }
        res.render("postDetail",{
            pageTitle: post.title,
            path: "/post",
            post,
            formatDate
        });

        
    } catch (err) {
        console.log(err);
        res.render("errors/500")
    }

}