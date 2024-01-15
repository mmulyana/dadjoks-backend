const Comment = require('../model/comment.js')
const Post = require('../model/post.js')
const User = require('../model/user.js')
const mongoose = require('mongoose')
const { getUser, createUser, findUser } = require('../services/user.js')
const {
  getAllPosts,
  getPost,
  createPost,
  findPostByUser,
  updatePost,
  deletePost,
  likePost,
  laughPost,
} = require('../services/post.js')
const {
  notFoundError,
  dbError,
  unauthorizedError,
} = require('../utils/error.js')
const {
  getAllCommentsByPostId,
  createComment,
  findComment,
  updateComment,
  deleteComment,
} = require('../services/comment.js')

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
    createUser: async (__, { input }) => createUser({ ...input }),
    createPost: async (__, { input }) => {
      const user = await findUser(input.user_id)
      return createPost({ ...input, user })
    },
    updatePost: async (__, { input }) => {
      const user = await findUser(input.user_id)
      const isPost = await findPostByUser({ post_id: input.post_id, user })
      return !!isPost && updatePost({ ...input, user })
    },
    deletePost: async (__, { input }) => {
      const user = await findUser(input.user_id)
      const isPost = await findPostByUser({ post_id: input.id, user })
      return !!isPost && deletePost(input.id)
    },
    createComment: async (__, { input }) => {
      await findUser(input.user_id)
      const post = await Post.findOne({ _id: input.post_id })
      return !!post && createComment({ ...input, post })
    },
    updateComment: async (__, { input }) => {
      const user = await findUser(input.user_id)
      const isComment = await findComment({ id: input.id, user })
      return !!isComment && updateComment({ ...input })
    },
    deleteComment: async (__, { input }) => {
      const user = await findUser(input.user_id)
      const isComment = await findComment({ id: input.id, user })
      const post = await Post.findOne({ _id: input.post_id })
      return !!isComment && deleteComment({ ...input, post })
    },
    likesPost: async (__, { input }) => {
      await findUser(input.user_id)
      return likePost({ ...input })
    },
    laughPost: async (__, { input }) => {
      await findUser(input.user_id)
      return laughPost({ ...input })
    },
  },
  Post: {
    comments: async (post) => getAllCommentsByPostId(post._id),
  },
}

module.exports = { resolvers }
