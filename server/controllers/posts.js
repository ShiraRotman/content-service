const { getUsersList } = require('../utils/users')
const Post = require('../models/post')
const Comment = require('../models/comment')
const Category = require('../models/category')

const LIMIT = 30
const MAX_LIMIT = 300

function getCategoryFromRequest ({ query, category }) {
  if (category && category._id) {
    return Promise.resolve(category._id)
  }
  if (query.category) {
    return Category.getCategoryIdByPath(query.category)
  }
  return Promise.resolve(null)
}

function getDisplayPost (post, category, authorsMap = {}, comments) {
  return Object.assign(post, {
    authors: post.authors.map(a => authorsMap[a]).filter(Boolean),
    category: {
      name: category.name,
      path: category.path
    },
    comments: comments ? comments.map(c => c.author = authorsMap[c.author]) : undefined
  })
}

function getPostQuery (path, category, isLean) {
  const query = Post.findOne({ path, category })

  if (isLean) {
    return query.select('-editorContentsStates').lean()
  }
  return query
}

function getPostByPath (req, res, next) {
  getPostQuery(
    req.params.postPath,
    req.category._id,
    req.query.target === 'front' || !(req.user && req.user.isEditor)
  )
    .then(post => {
      if (!post) {
        return Promise.reject(null)
      }
      req.post = post
      return next()
    })
    .catch(() => res.status(404).json({ message: 'post not exists' }).end())
}

function getPostById (req, res, next) {
  Post.findById(req.params.postId)
    .populate('category', 'name path')
    .then(post => {
      if (!post) {
        return Promise.reject(null)
      }
      req.post = post
      req.category = post.category
      return next()
    })
    .catch(() => res.status(404).json({ message: 'post not exists' }).end())
}

function getPostsList (req, res) {
  const reqQuery = req.query || {}
  const isFrontTargeted = reqQuery.target === 'front'

  const query = isFrontTargeted ? { isPublic: true } : {}

  const isLean = reqQuery.lean === 'true'
  const limit = parseInt(reqQuery.limit) || LIMIT
  const offset = parseInt(reqQuery.offset) || 0
  const populateCategories = req.user && req.user.isEditor && reqQuery.populate.includes('categories')

  if (reqQuery.q) {
    const reg = new RegExp(reqQuery.q, 'i')
    if (isLean) {
      query.title = reg
    } else {
      query.$or = [
        { title: reg },
        { short: reg },
      ]
      if (req.q > 10) {
        query.$or.push({ contents: reg })
      }
    }
  }

  getCategoryFromRequest(req)
    .then(categoryId => {
      if (categoryId) {
        query.category = categoryId
      }
    })
    .then(() => Post.search(
      query,
      isLean ? 'title category' : '-contents -editorContentsStates',
      {
        limit: limit > MAX_LIMIT ? MAX_LIMIT : limit,
        offset,
        categoriesPopulate: populateCategories ? 'path name' : 'path',
      })
    )
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }
      res.status(200)
        .json(
          list.map(post => {
            if (!populateCategories) {
              post.category = post.category.path
            }
            return post
          })
        )
        .end()
    })
    .catch((err) => {
      console.log('ERROR LOADING POSTS', err)
      res.status(400).json({ message: 'failed to load posts list' }).end()
    })
}

function getPost (req, res) {
  Comment.find({ post: req.post._id }).lean()
    .then(comments => comments || [], () => [])
    .then(comments => {
      const authors = comments.map(c => c.author).concat(req.post.authors)
      req.comments = comments
      return getUsersList(authors)
    })
    .then(authors => {
      res.status(200)
        .json(
          getDisplayPost(
            req.post.toObject ? req.post.toObject() : req.post,
            req.category,
            authors.reduce((authorsMap, author) => authorsMap[author._id] = author, {}),
            req.comments)
        ).end()
    })
}

function createPost (req, res) {
  const body = req.body || {}

  Category.getCategoryIdByPath(body.category)
    .then(categoryId => categoryId || Promise.reject('category path does not exist'))
    .then(categoryId => {
      body.category = categoryId
      body.authors = body.authors || []

      if (!body.authors.includes(req.user._id)) {
        body.authors.push(req.user._id)
      }
      return (new Post(body)).save()
    })
    .then(post => {
      if (!post) {
        return Promise.reject(null)
      }
      post = post.toObject()
      post.category = body.category
      res.status(200).json(post).end()
    })
    .catch((err) => res.status(400).json({ message: err || 'post creation failed' }).end())
}

function updatePost (req, res) {
  const body = req.body || {}
  const post = req.post

  Promise.resolve(body)
    .then(body => {
      if (!post.authors.includes(req.user._id)) {
        post.authors.push(req.user._id)
      }

      // category replaced
      if (body.category && body.category !== req.category.path) {
        return Category.getCategoryIdByPath(body.category).then(id => {
          body.category = id
          return body
        })
      }
      delete body.category
      return body
    })
    .then(body => Object.assign(post, body))
    .then(post => post.save())
    .then(post => {
      res.status(200).json(getDisplayPost(post.toObject(), req.category)).end()
    })
    .catch(() => res.status(400).json({ message: 'post update failed' }).end())
}

function removePost (req, res) {
  const post = req.post

  post.remove()
    .then(post => {
      res.status(200).json(getDisplayPost(post.toObject(), req.category)).end()
    })
    .catch(() => res.status(400).json({ message: 'post remove failed' }).end())
}

module.exports = {
  getPostByPath,
  getPostById,
  getPostsList,
  getPost,
  createPost,
  updatePost,
  removePost,
}
