const {Schema, model } = require("mongoose");

const commentSchema = new Schema({
    content: {
        type: String,
    },
    commentedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    commentedOnBlog: {
        type: Schema.Types.ObjectId,
        ref: "blog",
    },
},
{ timestamps: true },
);

const Comment = model("comment", commentSchema);

module.exports = Comment;