const path = require('path');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');

const connectDB = require('./config/db');

const blogRoutes = require('./routes/blog');
const dashRoutes = require('./routes/dashboard');

//* Load Config
dotEnv.config({
    path: "./config/config.env"
});

//* Database Connection
connectDB();


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

//* Statics Folder
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, process.env.BOOTSTRAP)));
// app.use(express.static(path.join(__dirname, process.env.FONTAWESOME)));

//* Routes
app.use(blogRoutes);
app.use("/dashboard", dashRoutes);


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`))