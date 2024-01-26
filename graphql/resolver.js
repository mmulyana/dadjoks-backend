const {
  getAllJokes,
  getJoke,
  createJoke,
  updateJoke,
  deleteJoke,
} = require('../services/joke.js')
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
    updateJoke: async (__, { input }) => updateJoke({ ...input }),
    deleteJoke: async (__, { input }) => deleteJoke({ ...input }),
  },
  Post: {},
}

module.exports = { resolvers }
