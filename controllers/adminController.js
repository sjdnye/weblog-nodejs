const multer = require('multer');
const sharp = require('sharp');
const uuid = require('uuid').v4;
const shortId = require('shortid');

const Blog = require('../models/Blog');
const {formatDate}  = require('../utils/jalali');
const {get500} = require('./errorController');
const  {storage, fileFilter} = require('../utils/multer');


exports.getDashboard = async(req, res) => {
    // const page = +req.query.page; // this is for query approach . + is for transforming string to integer
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

exports.getEditPost = async(req, res) => {
    try {
        const post = await Blog.findOne({_id: req.params.id});
        console.log(post.status);

        if(!post){
            return res.redirect("/errors/404");
        }

        if(post.user.toString() != req.user._id){
            res.redirect("/dashboard")

        }
        else{
            res.render("private/editPost", {
                pageTitle: "بخش مدیریت | ویرایش پست ",
                path: "/dashboard/edit-post",
                layout: "./layouts/dashLayout",
                fullname: req.user.fullname,
                post: post
            })

        }

    } catch (err) {
        console.log(err);
    }

}

exports.handleAddpost = async(req, res) => {
    const errors = [];
    try {
        // const { title, body, status } = req.body
        // await Blog.create({
        //     title,
        //     body,
        //     status
        // })
        await Blog.postValidation(req.body);
        await Blog.create({...req.body, user: req.user.id });

        res.redirect("/dashboard")
    } catch (err) {
        err.inner.forEach(e => {
            errors.push({
                path: e.path,
                message: e.message
            })
        })
        
        res.render("private/addPost", {
            pageTitle: "بخش مدیریت | ساخت پست جدید",
            path: "/dashboard/add-post",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            errors
        })
    }
}

exports.handleEditPost = async(req ,res) => {
    const errors = [];
    const post = await Blog.findOne({_id: req.params.id})
    try {
        await Blog.postValidation(req.body);

        if (!post) {
            return res.redirect("errors/404");
        }

        if (post.user.toString() != req.user._id) {
            return res.redirect("/dashboard");
        } else {
            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;

            await post.save();
            return res.redirect("/dashboard");
        }
  
    } catch (err) {
        err.inner.forEach(e => {
            errors.push({
                path: e.path,
                message: e.message
            })
        })
        
        res.render("private/editPost", {
            pageTitle: "بخش مدیریت | ویرایش پست ",
            path: "/dashboard/edit-post",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            errors,
            post
        })
    }

}

exports.getDeletePost = async(req, res) => {
    try {
        const result =  await Blog.findByIdAndRemove(req.params.id);
        res.redirect("/dashboard")
        
    } catch (err) {
        console.log(err);
        res.render("errors/500");
    }
       

}

exports.handleDeletePost = (req, res) => {

}

exports.handleUploadImage = (req, res) => {
    const upload = multer({
        limits: {
            fileSize: 4000000
        },
        // dest: "uploads/",
        // storage: storage,
        fileFilter: fileFilter
    }).single("image");

    upload(req, res, async(err) => {
        if(err){
            if(err.code === "LIMIT_FILE_SIZE"){
                return res
                .status(400)
                .send("حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد")
            }
            res.status(400).send(err);
        }else{
            if(req.file){
                const filename = `${shortId.generate()}_${req.file.originalname}`
                await sharp(req.file.buffer).jpeg({
                    quality: 60
                })
                .toFile(`./public/uploads/${filename}`)
                .catch(err => {
                    console.log(err);
                })
                // res.json({"message": "", "address": ""});
    
                res.status(200).send(`http://localhost:3000/uploads/${filename}`)
            }else{
                res.send("جهت آپلود باید عکسی انتخاب کنید")
            }
        }
    })
}
