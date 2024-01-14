const { notFoundError } = require('../utils/error')

async function getAllCommentsByPostId(post_id) {
  try {
    const comments = await Comment.aggregate([
      {
        $match: {
          post_id: new mongoose.Types.ObjectId(post_id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'user',
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
        },
      },
    ])

    return comments.map((comment) => ({
      ...comment,
      post_id: comment.post_id?.toString(),
      reply_id: comment.reply_id?.toString(),
      user: {
        _id: comment.user?._id?.toString(),
        username: comment.user?.username || 'Unknown User',
        ...comment.user,
      },
    }))
  } catch (error) {
    throw notFoundError(error)
  }
}

module.exports = { getAllCommentsByPostId }
