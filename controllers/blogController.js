const Yup = require("yup");
const captchapng = require('captchapng');


const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");
const { truncate } = require('../utils/helpers');

let CAPTCHA_NUM;

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


exports.getContactPage = (req, res) => {

    res.render("contact", {
        pageTitle: "تماس با ما",
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: []
    })

}

exports.handleContactPage = async (req, res) => {
    const errorArr = [];

    const { fullname, email, message, captcha } = req.body;

    const schema = Yup.object().shape({
        fullname: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
        email: Yup.string()
            .email("آدرس ایمیل صحیح نیست")
            .required("آدرس ایمیل الزامی می باشد"),
        message: Yup.string().required("پیام اصلی الزامی می باشد"),
    });

    try {
        await schema.validate(req.body, { abortEarly: false });

        if (parseInt(captcha) === CAPTCHA_NUM) {
            sendEmail(
                email,
                fullname,
                "پیام از طرف وبلاگ",
                `${message} <br/> ایمیل کاربر : ${email}`
            );

            req.flash("success_msg", "پیام شما با موفقیت ارسال شد");

            return res.render("contact", {
                pageTitle: "تماس با ما",
                path: "/contact",
                message: req.flash("success_msg"),
                error: req.flash("error"),
                errors: errorArr,
            });
        }else{
            req.flash("error", "کد امنیتی صحیح نیست");

            res.render("contact", {
                pageTitle: "تماس با ما",
                path: "/contact",
                message: req.flash("success_msg"),
                error: req.flash("error"),
                errors: errorArr,
            });
        }

    
    } catch (err) {
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("contact", {
            pageTitle: "تماس با ما",
            path: "/contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
        });
    }
};

exports.getCaptcha = (req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
    const p = new captchapng(80, 30, CAPTCHA_NUM);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};