require('dotenv').config({})
const express = require('express')
const cors = require('cors')
const { expressMiddleware } = require('@apollo/server/express4')

const { readFile } = require('node:fs/promises')
const { ApolloServer } = require('@apollo/server')
const { resolvers } = require('./graphql/resolver.js')
const { default: mongoose } = require('mongoose')

const PORT = 9000

async function startServer() {
  const app = express()

  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => console.log(err))

  app.use(cors())
  app.use(express.json())

  const typeDefs = await readFile('./graphql/schema.graphql', 'utf8')

  const apolloServer = new ApolloServer({ typeDefs, resolvers })
  await apolloServer.start()

  app.use('/graphql', expressMiddleware(apolloServer))

  app.listen({ port: PORT }, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}

startServer()
