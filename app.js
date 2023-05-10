const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const debug = require('debug')("weblog-project");
const bodyParser = require('body-parser');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const connectDB = require('./config/db');
const winston = require('./config/winston');

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
    app.use(morgan('combine', { stream: winston.stream }));
}

//* View Engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set("layout", "./layouts/mainLayout");
app.set('views', 'views');

//* Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));

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


app.listen(PORT, () => debug(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`));