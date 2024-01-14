const { GraphQLError } = require('graphql')

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  })
}

function dbError(message) {
  return new GraphQLError(message)
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  })
}

module.exports = {
  notFoundError,
  dbError,
  unauthorizedError,
}
