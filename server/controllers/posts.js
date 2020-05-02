const { getUsersList } = require('../utils/users')
const Post = require('mongoose').model('Post')
const Comment = require('../models/comment')
const { Category } = require('../models/category')

const LIMIT = 30
const MAX_LIMIT = 300

function getCategoryFromRequest (req) {
  if (req.category && req.category._id) {
    return Promise.resolve(req.category._id)
  }
  if (req.query.category) {
    return Category.getCategoryIdByPath(req.query.category)
  }
  return Promise.resolve(null)
}

function getDisplayPost (post, category, authorsMap = {}, comments) {
  return {
    ...post.toObject ? post.toObject() : post,
    authors: post.authors.map(a => authorsMap[a]),
    category: {
      name: category.name,
      path: category.path
    },
    comments: comments ? comments.map(c => c.author = authorsMap[c.author]) : undefined
  }
}

function getPostByPath (req, res, next) {
  const isEditor = req.user && req.user.isEditor

  let query = Post.findOne({ path: req.params.postPath, category: req.category._id })

  if (req.query.target === 'front' || !isEditor) {
    query = query.select('-editorContentsStates').lean()
  }

  return query
    .then(post => {
      if (!post) {
        return Promise.reject(null)
      }
      req.post = post
      return next()
    })
    .catch(() => res.status(404).jsonp({ message: 'post not exists' }).end())
}

function getPostById (req, res, next) {
  return Post.findById(req.params.postId)
    .populate('category', 'name path')
    .then(post => {
      if (!post) {
        return Promise.reject(null)
      }
      req.post = post
      req.category = post.category
      return next()
    })
    .catch(() => res.status(404).jsonp({ message: 'post not exists' }).end())
}

function getPostsList (req, res) {
  const reqQuery = req.query || {}
  const isFrontTargeted = req.query.target === 'front'

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

  return getCategoryFromRequest(req)
    .then(categoryId => {
      if (categoryId) {
        query.category = categoryId
      }
    })
    .then(() =>
      Post.find(query)
        .select(isLean ? 'title category' : '-contents -editorContentsStates')
        .sort({ created: -1 })
        .populate('category', 'path' + (populateCategories ? ' name' : ''))
        .limit(limit > MAX_LIMIT ? MAX_LIMIT : limit)
        .skip(offset)
        .lean()
    )
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }
      res.status(200)
        .jsonp(
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
      res.status(400).jsonp({ message: 'failed to load posts list' }).end()
    })
}

function getPost (req, res) {
  return Comment.find({ post: req.post._id }).lean()
    .then(comments => comments || [])
    .catch(() => [])
    .then(comments => {
      const authors = comments.map(c => c.author).concat(req.post.authors)
      req.comments = comments
      return getUsersList(authors)
    })
    .then(authors => {
      const authorsMap = {}
      authors.forEach(a => authorsMap[a._id] = a)
      res.status(200).jsonp(getDisplayPost(req.post, req.category, authorsMap, req.comments)).end()
    })
}

function createPost (req, res) {
  const body = req.body || {}

  return Category.getCategoryIdByPath(body.category)
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
      res.status(200).jsonp(post).end()
    })
    .catch((err) => res.status(400).jsonp({ message: err || 'post creation failed' }).end())
}

function updatePost (req, res) {
  const body = req.body || {}
  const post = req.post

  return Promise.resolve(body)
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
      res.status(200).jsonp(getDisplayPost(post, req.category)).end()
    })
    .catch(() => res.status(400).jsonp({ message: 'post update failed' }).end())
}

function removePost (req, res) {
  const post = req.post

  return post.remove()
    .then(post => {
      res.status(200).jsonp(getDisplayPost(post, req.category)).end()
    })
    .catch(() => res.status(400).jsonp({ message: 'post remove failed' }).end())
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
