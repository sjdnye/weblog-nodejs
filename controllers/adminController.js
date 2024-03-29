const multer = require('multer');
const sharp = require('sharp');
const uuid = require('uuid').v4;
const shortId = require('shortid');
const appRoot = require('app-root-path');
const fs = require('fs');


const Blog = require('../models/Blog');
const {formatDate}  = require('../utils/jalali');
const {get500} = require('./errorController');
const  {storage, fileFilter} = require('../utils/multer');


exports.getDashboard = async(req, res) => {
 
    const page = +req.query.page || 1; // this is for query approach . + is for transforming string to integer
    const postPerPage = 5;
    try {
        const numberOfPost = await Blog.find({user: req.user._id}).countDocuments();

        const blogs = await Blog.find({ user: req.user.id })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage)
            .sort({ createdAt : "desc"})

        res.set(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
        );

        res.render("private/blogs", {
            pageTitle: "بخش مدیریت | داشبورد",
            path: "/dashboard",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            blogs: blogs,
            formatDate: formatDate,
            currentPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPrevPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
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
        get500(req,res);
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
        const thumbnail = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnail.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
        req.body =  { ...req.body, thumbnail };

        await Blog.postValidation(req.body);
        await sharp(thumbnail.data)
            .jpeg({ quality: 60 })
            .toFile(uploadPath)
            .catch((err) => console.log(err));

        await Blog.create({
            ...req.body,
            user: req.user.id,
            thumbnail: fileName,
        });
        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
      if(err.inner){
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
      }else{
        res.render("errors/500")
      }
    }
}

exports.handleEditPost = async(req ,res) => {
    const errors = [];
    const post = await Blog.findOne({_id: req.params.id})
    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    try {
        if(thumbnail.name){
            await Blog.postValidation({... req.body, thumbnail});
        }else{
            await Blog.postValidation({... req.body, thumbnail : {name: "placeholder", size:0, mimetype: "image/jpeg"}})
        }
        if (!post) {
            return res.redirect("/404");
        }

        if (post.user.toString() != req.user._id) {
            return res.redirect("/dashboard");
        } else {

            if(thumbnail.name){
                fs.unlink(`${appRoot}/public/uploads/thumbnails/${post.thumbnail}`, async(err) => {
                    if(err) console.log(err);
                    else{
                        await sharp(thumbnail.data)
                        .jpeg({ quality: 60 })
                        .toFile(uploadPath)
                        .catch((err) => console.log(err));
                    }
                })
            }

            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;
            post.thumbnail = thumbnail.name ? fileName : post.thumbnail;
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
        get500(req, res);
    }
       

}


exports.handleUploadImage = (req, res) => {
    const upload = multer({
        limits: { fileSize: 4000000 },
        // dest: "uploads/",
        // storage: storage,
        fileFilter: fileFilter,
    }).single("image");
    //req.file
    // console.log(req.file)
    upload(req, res, async (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res
                    .status(400)
                    .send("حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد");
            }
            res.status(400).send(err);
        } else {
            if (req.files) {
                const fileName = `${shortId.generate()}_${
                    req.files.image.name
                }`;
                await sharp(req.files.image.data)
                    .jpeg({
                        quality: 60,
                    })
                    .toFile(`./public/uploads/${fileName}`)
                    .catch((err) => console.log(err));
                res.status(200).send(
                    `http://sjdnye.dev/uploads/${fileName}`
                );
            } else {
                res.send("جهت آپلود باید عکسی انتخاب کنید");
            }
        }
    });
};


exports.handleDashboardSearch = async(req, res) => {

    const page = +req.query.page || 1; // this is for query approach . + is for transforming string to integer
    const postPerPage = 5;
    try {
        const numberOfPost = await Blog.find({
            user: req.user._id,
            $text : {$search : req.body.search}
        }).countDocuments();

        const blogs = await Blog.find({
             user: req.user.id,
             $text : {$search : req.body.search}
             })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage)
            .sort({ createdAt : "desc"})

        res.render("private/blogs", {
            pageTitle: "بخش مدیریت | داشبورد",
            path: "/dashboard",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            blogs: blogs,
            formatDate: formatDate,
            currentPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPrevPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
        })
    } catch (err) {
         get500(req, res);
    }  
}