const { getAllJokes, getJoke, createJoke } = require('../services/joke.js')
const {
  notFoundError,
  dbError,
  unauthorizedError,
} = require('../utils/error.js')

const resolvers = {
  Query: {
    user: async (__, { email }) => {
      return {}
    },
    jokes: async () => getAllJokes(),
    joke: async (__, { id }) => getJoke(id),
    comments: async (__, { id }) => {},
  },

  Mutation: {
    createJoke: async (__, { input }) => createJoke({ ...input }),
  },
  Post: {
  },
}

module.exports = { resolvers }
