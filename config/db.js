const mongoose = require('mongoose');
const debug = require('debug')("weblog-project");


const connectDB = async() => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                // useFindAndModify: true
            }
        );
        debug(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;