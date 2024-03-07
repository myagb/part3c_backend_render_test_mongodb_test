/*
See sec 3a for details of using Express
to form a server that provides a RESTful
HTTP API.

See sec 3b and 3c for running app on internet and connecting to mongodb
 */

require('dotenv').config() // read env variables, see details in part 3c
// note that git ignores .env file. When using Render, the database url 
// is given by defining the proper env in the dashboard (see part 3c)


const express = require('express')
const app = express()

app.use(express.json())

const cors = require('cors')
app.use(cors())

const Note = require('./models/note') // our own module for mongoose-specific code


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})


app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {

      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
    // .catch(error => {
    //   console.log(error)
    //   // response.status(500).end()
    //   response.status(400).send({ error: 'malformatted id' })
    // })
})


app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})


app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})



// error handling using express middleware, see its use in the code and for details part3c
const errorHandler = (error, request, response, next) => { 
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
