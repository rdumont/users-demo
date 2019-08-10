const mongoose = require('mongoose')

const User = mongoose.model('user', new mongoose.Schema({
  name: String,
  email: String
}))

User.sanitize = user => {
  const { _id, __v, ...doc } = user.toObject()
  return { id: _id, ...doc }
}

module.exports = User
