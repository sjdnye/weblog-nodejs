const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require("express-session");
const passport = require('passport');

const connectDB = require('./config/db');

//* Load Config
dotEnv.config({
    path: "./config/config.env"
});

//* Database Connection
connectDB();

//* Passport Configuration
require('./config/passport');


const app = express();

//* Logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

//* View Engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set("layout", "./layouts/mainLayout");
app.set('views', 'views');

//* Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));

//* Session
app.use(
    session({
        secret: "secret",
        maxAge: 600000,
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: true,
    })
);

//* Passport
app.use(passport.initialize());
app.use(passport.session());

//* Flash
app.use(flash());

//* Statics Folder
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, process.env.BOOTSTRAP)));
// app.use(express.static(path.join(__dirname, process.env.FONTAWESOME)));



//* Routes
app.use("/", require('./routes/blog'));
app.use("/users", require('./routes/users'));
app.use("/dashboard", require('./routes/dashboard'));


//* 404 Page
app.use((req, res) => {
    res.render("404", {
        pageTitle: "404",
        path: "/404"
    })
});


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`));