const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}
// uses command line arguments like we did in CS50. 
const password = process.argv[2]

const url = `mongodb+srv://danielcsillag:${password}@fsodb.iwmvlro.mongodb.net/noteApp?retryWrites=true&w=majority&appName=FSODB`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)
/* Code to create a new DB entry
const note = new Note({
  content: 'HTML is easy',
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})*/

// Lets now query the DB instead
Note.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})