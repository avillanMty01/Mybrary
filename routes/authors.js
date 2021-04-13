const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

// All authors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        // it's a GET request, data is not in body, is in query in the URL
        // so we use req.query.name  instead of req.body
        // Now, we use a regular expression, with upper/lowe ignored 'i'
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query })
    } catch(err) {
        console.log(err)
        res.redirect('/')
    }
})

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// Create author route
router.post('/', async (req, res) => {
   const author = new Author({
       name: req.body.name
   })
   try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
   } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
       })
   }
})

// route for viewing an author, :id  is a variable that will be passed
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch(err) {
        res.redirect('/')
    }
})

// open in edit mode
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
    
    
})

// saving changes
router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        // we did not get an author
        if (author == null) {
            res.redirect('/')
        } else {
            res.render('/authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            }) // something else went wrong
        }
    }
})

// deleting an author
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch {
        // we did not get an author
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

//  warning, we cannot do a PUT  or DELETE directly from browser
// only get and post. We need a library that allows us to do the "put delete"
// 
module.exports = router