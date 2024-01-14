const Comment = require('../model/comment')
const Post = require('../model/post')
const { notFoundError } = require('../utils/error')
const mongoose = require('mongoose')

async function getAllPosts(page) {
  const POSTS_PER_PAGE = 10
  const SKIP = (page - 1) * POSTS_PER_PAGE

  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'author',
        },
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $skip: SKIP,
      },
      {
        $limit: POSTS_PER_PAGE,
      },
    ])

    if (!posts && posts.length === 0) {
      return []
    }

    return posts.map((post) => ({
      ...post,
      post_id: post._id?.toString(),
      author: {
        _id: post.author?._id?.toString(),
        username: post.author?.username || 'Unknown User',
        ...post.author,
      },
    }))
  } catch (error) {
    throw notFoundError(error)
  }
}

async function getPost(id) {
  const post = await Post.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'author',
      },
    },
    {
      $addFields: {
        author: { $arrayElemAt: ['$author', 0] },
      },
    },
  ])

  if (!post || post.length === 0) {
    throw notFoundError('post is not found')
  }

  return {
    post_id: post[0]._id?.toString(),
    ...post[0],
    author: {
      _id: post[0].author?._id?.toString(),
      username: post[0].author?.username || 'Unknown User',
      ...post[0].author,
    },
  }
}

module.exports = { getAllPosts, getPost }
