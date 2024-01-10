const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
    },
    count_likes: {
      type: Number,
    },
    count_laugh: {
      type: Number,
    },
    count_comment: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Post', postSchema)
