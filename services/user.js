const Comment = require('../model/comment')
const Post = require('../model/post')
const User = require('../model/user.js')
const { unauthorizedError } = require('../utils/error.js')

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

async function createUser({ username, image_url, role, user_id }) {
  try {
    const newUser = new User({
      username,
      image_url,
      role,
      user_id,
    })

    const createdUser = await newUser.save()
    return {
      ...createdUser._doc,
      comments: [],
      posts: [],
    }
  } catch (error) {
    throw error
  }
}

async function findUser(user_id) {
  const user = await User.findOne({ user_id })
  if (!user) {
    throw unauthorizedError('Missing authentication')
  }
  return user
}

module.exports = { getUser, createUser, findUser }
