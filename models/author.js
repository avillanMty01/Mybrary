const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next) {
     Book.find({ author: this.id }, (err, books) => {
          if (err) {
              next(err)
          } else if (books.length > 0) {
              //there are books that correspond to this author
              next( new Error('This author has books in db'))
          } else {
              next() //tell mongoose ok to continue and delete
          }
    })
})

module.exports = mongoose.model('Author', authorSchema)