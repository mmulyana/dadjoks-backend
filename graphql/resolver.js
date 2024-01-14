const User = require('../model/user.js')
const Comment = require('../model/comment.js')
const Post = require('../model/post.js')
const mongoose = require('mongoose')
const { getUser } = require('../services/user.js')
const { getAllPosts, getPost } = require('../services/post.js')
const {
  notFoundError,
  dbError,
  unauthorizedError,
} = require('../utils/error.js')
const { getAllCommentsByPostId } = require('../services/comment.js')

const resolvers = {
  Query: {
    user: async (__, { username }) => {
      const user = await User.findOne({ username })
      if (!user) {
        throw notFoundError('user not found')
      }
      const userData = getUser(user)
      return userData
    },
    posts: async (__, { page = 1 }) => getAllPosts(page),
    post: async (__, { id }) => getPost(id),
    comments: async (__, { id }) => getAllCommentsByPostId(id),
  },

  Mutation: {
    // ✅
    createUser: async (
      __,
      { input: { username, image_url, role, user_id } }
    ) => {
      const newUser = new User({
        username,
        image_url,
        role,
        user_id,
      })

      const createdUser = await newUser.save()
      return {
        ...createdUser._doc,
      }
    },
    // ✅
    createPost: async (__, { input: { content, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }

      const newPost = new Post({
        content,
        user_id,
        count_comment: 0,
        count_laugh: 0,
        count_likes: 0,
      })

      const createdPost = await newPost.save()
      return {
        ...createdPost._doc,
        post_id: createdPost._id.toString(),
        author: {
          ...user._doc,
        },
      }
    },
    // ✅
    updatePost: async (__, { input: { post_id, content, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }

      const post = await Post.findOne({
        _id: post_id,
        user_id: user_id,
      })
      if (!post) {
        throw notFoundError('Missing post')
      }

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
    },
    // ✅
    deletePost: async (__, { input: { id, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }

      const post = await Post.findOne({
        _id: id,
        user_id: user_id,
      })
      if (!post) {
        throw notFoundError('Missing post')
      }

      await Post.findByIdAndDelete(id)
      return post
    },
    // ✅
    createComment: async (
      __,
      { input: { post_id, message, reply_id, user_id } }
    ) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }
      const post = await Post.findOne({ _id: post_id })
      if (!post) {
        throw notFoundError('post is missing')
      }

      const newComment = new Comment({
        message,
        post_id,
        reply_id,
        user_id: user_id,
      })

      const createdComment = await newComment.save()

      let oldCountComment =
        typeof post.count_comment == 'undefined' ? 0 : post.count_comment
      post.count_comment = oldCountComment + 1
      await post.save()

      return {
        ...createdComment._doc,
        _id: createdComment._id.toString(),
      }
    },
    // ✅
    updateComment: async (__, { input: { id, message, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }
      const comment = await Comment.findOne({
        _id: id,
        user_id: user.user_id,
      })
      if (!comment) {
        throw notFoundError('comment is missing')
      }

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
    },
    // ✅
    deleteComment: async (__, { input: { id, post_id, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }

      const post = await Post.findOne({ _id: post_id })
      if (!post) {
        throw notFoundError('post is missing')
      }

      const deletedComment = await Comment.findByIdAndDelete(id)
      let oldCountComment = post.count_comment
      post.count_comment = oldCountComment--
      await post.save()

      return {
        ...deletedComment._doc,
      }
    },
    // ✅
    likesPost: async (__, { input: { post_id, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }

      const post = await Post.findById(post_id)
      post.count_likes = post.count_likes + 1

      const newPost = await post.save()
      return {
        ...newPost._doc,
      }
    },
    // ✅
    laughPost: async (__, { input: { post_id, user_id } }) => {
      const user = await User.findOne({ user_id })
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }

      const post = await Post.findById(post_id)
      post.count_laugh = post.count_laugh + 1

      const newPost = await post.save()
      return {
        ...newPost._doc,
      }
    },
  },
  // ✅
  Post: {
    comments: async (post) => {
      const comments = await Comment.aggregate([
        {
          $match: {
            post_id: new mongoose.Types.ObjectId(post._id),
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
        {
          $sort: { timestamp: -1 },
        },
      ])
      const formattedComments = comments.map((comment) => ({
        ...comment,
        post_id: comment.post_id?.toString(),
        reply_id: comment.reply_id?.toString(),
        user: {
          _id: comment.user?._id?.toString(),
          username: comment.user?.username || 'Unknown User',
          ...comment.user,
        },
      }))

      return formattedComments
    },
  },
}

module.exports = { resolvers }
