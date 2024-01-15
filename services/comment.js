const Comment = require('../model/comment')
const { notFoundError, dbError } = require('../utils/error')

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

async function createComment({ post_id, message, reply_id, user_id, post }) {
  const newComment = new Comment({
    message,
    post_id,
    reply_id,
    user_id: user_id,
  })

  const createdComment = await newComment.save()

  let oldCountComment = post.count_comment
  post.count_comment = oldCountComment + 1
  await post.save()

  return {
    ...createdComment._doc,
    _id: createdComment._id.toString(),
  }
}

async function findComment({ id, user }) {
  const comment = await Comment.findOne({
    _id: id,
    user_id: user.user_id,
  })
  if (!comment) {
    throw notFoundError('comment is missing')
  }
  return comment
}

async function updateComment({ id, message }) {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        message,
      },
      {
        new: true,
      }
    )

    return {
      ...updatedComment._doc,
    }
  } catch (error) {
    throw dbError(error)
  }
}

async function deleteComment({ id, post }) {
  const deletedComment = await Comment.findByIdAndDelete(id)
  let oldCountComment = post.count_comment
  post.count_comment = oldCountComment--
  await post.save()

  return {
    ...deletedComment._doc,
  }
}

module.exports = {
  getAllCommentsByPostId,
  createComment,
  findComment,
  updateComment,
  deleteComment
}
