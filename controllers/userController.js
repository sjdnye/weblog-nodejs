const bcrypt = require('bcryptjs');
const passport = require("passport");
const fetch = require('node-fetch');

const User = require('../models/User');


exports.login = (req, res) => {
    res.render("login", {
        pageTitle: "صفحه ورود",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error")
    })
}

exports.register = (req, res) => {
    res.render("register", {
        pageTitle: "ثبت نام کاربر",
        path: "/register"
    });
}

exports.handleLogin = async(req, res, next) => {
    if (!req.body["g-recaptcha-response"] || req.body["g-recaptcha-response"] == 'undefiend' || req.body["g-recaptcha-response"] == null) {
        req.flash("error", "اعتبارسنجی captcha الزامی میباشد");
        return res.redirect("/users/login");
    }
    const secretKey = process.env.CAPTCHA_SECRET
    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`

    const response = await fetch(verifyUrl, {
        method: "POST",
        header: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf8"
        }
    })

    const resultInJson = await response.json();
    const isSuccess = resultInJson.success;

    if (isSuccess) {
        console.log("I am hereeeeeeeeeeeeeeeeeeeeeeeee");
        passport.authenticate("local", {
            // successRedirect: "/dashboard",
            failureRedirect: "/users/login",
            failureFlash: true,
        })(req, res, next);
    } else {
        req.flash("error", "مشکلی در اعتبارسنجی captcha هست")
        res.redirect("/users/login")
    }


};

exports.rememberMe = (req, res) => {
    if (req.body.remember) {
        req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000 //24h

    } else {
        req.session.cookie.expire = null;
    }
    res.redirect("/dashboard")
}

exports.logout = (req, res) => {
    req.logout();
    req.flash("success_msg", "خروج موفقیت آمیز بود")
    res.redirect("/users/login")
}


exports.createUser = async(req, res) => {
    if (req.body) {
        // const validator = await registerSchema.isValid(req.body);
        // validator ? res.redirect("/") : res.send("Something went wrong!!")

        //OR ( Yup  + try catch)
        const errors = [];
        try {
            const { fullname, email, password } = req.body
            await User.userValidation(req.body)
            const user = await User.findOne({ email });

            if (user) {
                errors.push({
                    message: "کاربری با این ایمیل موجوداست"
                })
                return res.render("register", {
                    pageTitle: "ثبت نام کاربر",
                    errors: errors,
                    path: "/register"
                })
            } else {
                const hash = await bcrypt.hash(password, 10)
                await User.create({
                    fullname,
                    email,
                    password: hash
                })
                req.flash("success_msg", "ثبت نام موفقیت آمیز بود")
                res.redirect("/users/login")
                    // bcrypt.genSalt(10, (err, salt) => {
                    //     if (err) {
                    //         throw err
                    //     } else {
                    //         bcrypt.hash(password, salt, async(err, hash) => {
                    //             if (err) throw err

                //             await User.create({
                //                 fullname,
                //                 email,
                //                 password: hash
                //             })
                //             res.redirect("/users/login")
                //         })
                //     }
                // })

            }

            // const user = new User({
            //     fullname,
            //     email,
            //     password
            // })
            // user.save()
            //     .then(user => {
            //         return res.redirect("/users/login")

            //     })
            //     .catch(err => { if (err) throw err })


        } catch (err) {
            console.log(err);
            err.inner.forEach((e) => {
                errors.push({
                    path: e.path,
                    message: e.message,
                });
            });

            return res.render("register", {
                pageTitle: "ثبت نام کاربر",
                errors: errors,
                path: "/register"
            })

        }

        // User.userValidation(req.body)
        //     .then(result => {
        //         res.redirect("/users/login")
        //     }).catch(err => {
        //         // console.log(err);
        //         // for (let error of err.errors) {
        //         //     console.log(error);
        //         // }
        //         res.render("register", {
        //             pageTitle: "ثبت نام کاربر",
        //             errors: err.errors,
        //             path: "/register"
        //         })
        //     })

        // OR ( fastest validator )
        // const validate = validator.validate(req.body, schema);
        // const errorArr = [];
        // if (validate === true) {
        //     const { fullname, email, password, confirmPassword } = req.body;
        //     if (password != confirmPassword) {
        //         errorArr.push({ message: "کلمه های عبور یکسان نیستند" });
        //         return res.render("register", {
        //             pageTitle: "ثبت نام کاربر",
        //             path: "/register",
        //             errors: errorArr
        //         });
        //     }
        //     res.redirect("users/login");
        // } else {

        //     return res.render("register", {
        //         pageTitle: "ثبت نام کاربر",
        //         path: "/register",
        //         errors: validate
        //     });

        // }
    }
}