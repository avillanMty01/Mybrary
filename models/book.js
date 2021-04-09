const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'img/bookCovers'

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

// creating the path to the cover image
// use function() because we need "this."
// with arrow function it doesn't work
bookSchema.virtual('coverImagePath').get(function() {
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath