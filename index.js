// Import statements and defining an app. 
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const Note = require('./models/note')


// Define application middleware
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

// Setup mongoDB connections
/* Now done in the note.js model
const password = process.argv[2]

const url = `mongodb+srv://danielcsillag:${password}@fsodb.iwmvlro.mongodb.net/noteApp?retryWrites=true&w=majority&appName=FSODB`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = mongoose.model('Note', noteSchema)
*/

/*
let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
      },
      {
        id: "2",
        content: "Browser execute only JavaScript",
        important: false
      },
      {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]*/

// Defining the routes along which requests will travel. 
// Now we need to use a semicolon syntax to define request parameters
/*
app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})*/

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

/* New Method */
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
/* old method, direct to JSON 
app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id === id)
    response.status(204).end()
}) 
    */
/* Now direct to DB connections */
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id).then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => {
    next(error)
  })
})

const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => Number(n.id)))
      : 0
    return String(maxId + 1)
  }

/* Old method 
app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (!body.content) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
  
    const note = {
      content: body.content,
      important: body.important || false,
      id: generateId(),
    }
  
    notes = notes.concat(note)
  
    response.json(note)
}) */

/* Now with databases */
app.post('/api/notes', (request, response, next) => {
  const body = request.body
  /* Without server side validation
  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }*/

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const {content, important} = request.body

  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})