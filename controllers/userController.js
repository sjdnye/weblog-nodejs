const bcrypt = require('bcryptjs');
const passport = require("passport");

const User = require('../models/User');


exports.login = (req, res) => {
    res.render("login", {
        pageTitle: "صفحه ورود",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error")
    })
}

exports.register = (req, res, next) => {
    res.render("register", {
        pageTitle: "ثبت نام کاربر",
        path: "/register"
    });
}

exports.handleLogin = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true,
    })(req, res, next);
};


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