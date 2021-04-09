const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const uploadPath = path.join('public',
    Book.coverImageBasePath)
const Author = require('../models/author')
// if you misspell the types you get all sorts of errors like fileName undefined !
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (requ, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All books route
router.get('/', async (req, res) => {
    // 1 get the method
    let query = Book.find()
    // 2 construct query
    if (req.query.title != null && req.query.title !='' ) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !='' ) {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    // 3 execute query
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create book route
// upload.single('cover')   has to be the same as your views/books/_form_fields.ejs
// inside <input type="file" name="cover">
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch {
        if (book.coverImageName != null) {
           removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params )
    } catch {
        res.redirect('/books')
    }
}

module.exports = router