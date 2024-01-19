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

module.exports = {
  getAllJokes,
  getJoke,
  createJoke,
}
