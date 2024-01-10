const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  image_url: {
    type: String,
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    required: true,
  },
})

module.exports = mongoose.model('User', userSchema)
