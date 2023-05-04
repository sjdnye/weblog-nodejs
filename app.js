const path = require('path');

const express = require('express');

const indexRoutes = require('./routes/index');

const app = express();

//* View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//* Statics Folder
app.use(express.static(path.join(__dirname, "public")));

//* Routes
app.use(indexRoutes);


app.listen(3000, () => console.log(`App is running on port ${3000}...`))