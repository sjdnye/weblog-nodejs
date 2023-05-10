const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const expressLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const connectDB = require('./config/db');



//* Database Connection
connectDB();

//* Passport Configuration
require('./config/passport');


const app = express();

//* View Engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set("layout", "./layouts/mainLayout");
app.set('views', 'views');

//* Body-Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//* Upload File
app.use(fileUpload());

//* Session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        unset: "destroy",
        store: new MongoStore({ mongooseConnection: mongoose.connection })
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
app.use(require('./routes/blog'));
app.use("/users", require('./routes/users'));
app.use("/dashboard", require('./routes/dashboard'));
app.use("/post", require('./routes/posts'));


//* 404 Page
app.use(require('./controllers/errorController').get404);


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`));