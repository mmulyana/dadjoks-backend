const Comment = require('../model/comment')
const Post = require('../model/post')

async function getUser(user) {
  const posts = await Post.aggregate([
    {
      $match: { user_id: user.user_id },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'user',
      },
    },
  ])
  const comments = await Comment.aggregate([
    {
      $match: { user_id: user.user_id },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'user',
      },
    },
  ])

  return {
    ...user._doc,
    comments: comments.map((comment) => ({
      ...comment,
      _id: comment._id?.toString(),
      user: {
        _id: comment.user._id?.toString(),
        ...comment.user,
      },
    })),
    posts: posts.map((post) => ({
      ...post,
      _id: post._id?.toString(),
      author: {
        _id: post.user._id?.toString(),
        ...post.user,
      },
    })),
  }
}

module.exports = { getUser }
