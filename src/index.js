const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { checkSchema, validationResult } = require('express-validator')

const { port, mongoUrl } = require('./config')
const User = require('./user')

const validate = checkSchema({
  name: { isString: true, exists: true },
  email: { isString: true, exists: true }
})

const app = express()
  .get('/users', (req, res) => {
    return User.find()
      .then(users => users.map(User.sanitize))
      .then(users => res.status(200).json(users))
  })
  .get('/users/:id', ({ params: { id } }, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'User not found' })
    }

    return User.findById(mongoose.Types.ObjectId(id))
      .then(user => user
        ? res.status(200).json(User.sanitize(user))
        : res.status(404).json({ error: 'User not found' })
      )
  })
  .post('/users', [ bodyParser.json(), validate ], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    return User.create({
      name: req.body.name,
      email: req.body.email
    })
      .then(user => res.status(201).json(User.sanitize(user)))
  })
  .put('/users/:id', bodyParser.json(), (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    return User.findByIdAndUpdate(
      mongoose.Types.ObjectId(req.params.id),
      {
        name: req.body.name,
        email: req.body.email
      }, { new: true })
      .then(user => res.status(200).json(User.sanitize(user)))
  })
  .delete('/users/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }

    return User.findByIdAndDelete(req.params.id)
      .then(user => user
        ? res.status(204).end()
        : res.status(404).json({ error: 'User not found' })
      )
  })

mongoose.connect(mongoUrl, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => app.listen(port, () => console.log(`Listening on port ${port} 🚀`)))
