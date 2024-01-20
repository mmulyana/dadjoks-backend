const Comment = require('../model/comment')
const Post = require('../model/post')
const db = require('../utils/db')
const { notFoundError } = require('../utils/error')
const mongoose = require('mongoose')

async function getAllJokes(page) {
  try {
    const jokes = await db.joke.findMany({
      include: {
        author: true,
        replies: true,
      },
    })

    if (!jokes && jokes.length === 0) {
      return []
    }

    return jokes
  } catch (error) {
    throw notFoundError(error)
  }
}

async function getJoke(id) {
  const joke = await db.joke.findOne({
    include: {
      replies: true,
      author: true,
    },
    where: {
      id: id,
    },
  })
  if (!joke || joke.length === 0) {
    throw notFoundError('joke is not found')
  }

  return joke
}

async function createJoke({ text, authorId }) {
  const joke = await db.joke.create({
    data: {
      text,
      authorId,
    },
  })

  return joke
}

async function findJokesByAuthor({ authorId }) {
  const jokes = await db.joke.findMany({
    where: {
      authorId,
    },
  })

  return jokes
}

async function updateJoke({ text, authorId }) {
  try {
    const updatedAt = new Date()
    const joke = await db.joke.update({
      data: {
        text,
        updatedAt,
      },
      where: {
        authorId,
      },
    })

    return joke
  } catch (err) {
    throw dbError('Failed to update post')
  }
}

async function deleteJoke(id) {
  const joke = await db.joke.delete({
    where: {
      id,
    },
  })

  return joke
}

async function createReplyJoke(jokeId, typeReply) {
  const reply = await db.replies.create({
    data: {
      jokeId,
      typeReply,
    },
  })

  return reply
}

module.exports = {
  getAllJokes,
  getJoke,
  createJoke,
  findJokesByAuthor,
  updateJoke,
  deleteJoke,
  createReplyJoke,
}
