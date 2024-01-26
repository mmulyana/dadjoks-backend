const db = require('../utils/db')
const { notFoundError, dbError } = require('../utils/error')

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

async function updateJoke({ text, id, authorId }) {
  try {
    const updatedAt = new Date()
    const joke = await db.joke.update({
      data: {
        text,
        updatedAt,
      },
      where: {
        AND: [
          {
            id,
          },
          {
            authorId,
          },
        ],
      },
    })

    return joke
  } catch (err) {
    throw dbError(err.message)
  }
}

async function deleteJoke(id, authorId) {
  try {
    const joke = await db.joke.delete({
      where: {
        AND: [{ id }, { authorId }],
      },
    })
    return joke
  } catch (error) {
    throw dbError(error.message)
  }

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

async function deleteReplyJoke(id) {
  const reply = await db.replies.delete({
    where: {
      id,
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
  deleteReplyJoke,
}
