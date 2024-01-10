const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    reply_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: true,
  }
)

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
