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

async function createPost({ content, user_id, user }) {
  const newPost = new Post({
    content,
    user_id,
    count_comment: 0,
    count_laugh: 0,
    count_likes: 0,
  })
  console.log(user)
  const createdPost = await newPost.save()
  return {
    ...createdPost._doc,
    post_id: createdPost._id.toString(),
    author: {
      ...user._doc,
    },
  }
}

async function findPostByUser({ post_id, user }) {
  const post = await Post.findOne({
    _id: post_id,
    user_id: user.user_id,
  })
  if (!post) {
    throw notFoundError('Missing post')
  }

  return post
}

async function updatePost({ post_id, content, user }) {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      post_id,
      { content: content },
      { new: true }
    )

    if (!updatedPost) {
      throw notFoundError('Failed to update post')
    }

    return {
      ...updatedPost._doc,
      post_id: updatedPost._id.toString(),
      author: {
        ...user._doc,
      },
    }
  } catch (err) {
    throw dbError('Failed to update post')
  }
}

async function deletePost(id) {
  const deletedPost = await Post.findByIdAndDelete(id)
  return {
    ...deletedPost._doc,
  }
}

async function likePost({ post_id }) {
  const post = await Post.findById(post_id)
  post.count_likes = post.count_likes + 1

  const newPost = await post.save()
  return {
    ...newPost._doc,
  }
}

async function laughPost({ post_id }) {
  const post = await Post.findById(post_id)
  post.count_laugh = post.count_laugh + 1

  const newPost = await post.save()
  return {
    ...newPost._doc,
  }
}

module.exports = {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  findPostByUser,
  deletePost,
  likePost,
  laughPost,
}
