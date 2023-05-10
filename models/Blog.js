const mongoose = require("mongoose");
const {registerPostSchema} = require('./secure/postValidation');

const blogSchmea = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
    },
    body: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "public",
        enum: ["public", "private"],
    },
    thumbnail: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

blogSchmea.statics.postValidation = function(body) {
    return registerPostSchema.validate(body, { abortEarly: false });
}

module.exports = mongoose.model("Blog", blogSchmea);