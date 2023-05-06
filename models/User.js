const mongoose = require('mongoose');
const { registerSchema } = require('./secure/userValidation');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true

    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 255

    },
    createedAt: {
        type: Date,
        default: Date.now
    }
})

userSchema.statics.userValidation = function(body) {
    return registerSchema.validate(body, { abortEarly: false });
}

const User = mongoose.model("User", userSchema);

module.exports = User;