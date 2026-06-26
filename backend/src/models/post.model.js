import mongoose from "mongoose";
const { Schema } = mongoose;
const commentSchema = new Schema({
  UserID: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});
const postSchema = new Schema({
  UserID: {
    type: Number,
    required: true,
  },
  studyField: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },

  likesCount: {
    type: Number,
    default: 0,
  },
  likedBy: [{ type: Number }],
  //comments
  commentsCount: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
});

export const Post = mongoose.model("Post", postSchema);
