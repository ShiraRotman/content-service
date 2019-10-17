const callAuthService = require('../../helpers/call-auth-service')

const Post = require('mongoose').model('Post')
const Comment = require('mongoose').model('Comment')
const Category = require('mongoose').model('Category')

const LIMIT = 30
const MAX_LIMIT = 300

function getAuthorsList (ids) {
  return callAuthService('/api/users', {
    params: {
      users: ids.join(',')
    }
  })
}

function getCategoryIdByPath (path) {
  return Category
    .findOne({ path })
    .select('_id')
    .lean()
    .then(cat => cat ? cat._id : null)
}

function getCategoryFromRequest (req) {
  return Promise.resolve(req.category)
    .then(category => category ? category._id : null)
    .then(categoryId => categoryId || (req.query.category && getCategoryIdByPath(req.query.category)))
}

function getDisplayPost (post, category, authorsMap = {}, comments) {
  return {
    ...post.toObject(),
    authors: post.authors.map(a => authorsMap[a]),
    category: {
      name: category.name,
      path: category.path
    },
    comments: comments ? comments.map(c => c.author = authorsMap[c.author]) : undefined
  }
}

function getPostByPath (req, res, next) {
  let query = Post.findOne({ path: req.params.postPath, category: req.category._id })

  if (req.query.target === 'front') {
    query = query.select('-short')
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
  const query = typeof reqQuery.isPublic !== 'undefined' ?
    { isPublic: reqQuery.isPublic === 'true' } : {}

  const limit = parseInt(reqQuery.limit) || LIMIT
  const offset = parseInt(reqQuery.offset) || 0
  const populateCategories = req.user.isEditor && reqQuery.populate.includes('categories')

  return getCategoryFromRequest(req)
    .then(categoryId => {
      if (categoryId) {
        query.category = categoryId
      }
      return query
    })
    .then(query =>
      Post.find(query)
        .select('-content')
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
      return res.status(200)
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
    .catch(() => res.status(401).jsonp({ message: 'failed to load posts list' }).end())
}

function getPost (req, res) {
  return Comment.find({ post: req.post._id }).lean()
    .then(comments => comments || [])
    .catch(() => [])
    .then(comments => {
      const authors = [
        ...req.post.authors,
        ...comments.map(c => c.author),
      ]
      req.comments = comments
      return getAuthorsList(authors)
    })
    .then(authors => {
      const authorsMap = {}
      authors.forEach(a => authorsMap[a._id] = a)
      return res.status(200).jsonp(getDisplayPost(req.post, req.category, authorsMap, req.comments)).end()
    })
}

function createPost (req, res) {
  const body = req.body || {}

  return Promise.resolve(body.category)
    .then(getCategoryIdByPath)
    .then(categoryId => categoryId || Promise.reject('category path does not exist'))
    .then(categoryId => {
      body.category = categoryId
      return (new Post(body)).save()
    })
    .then(post => {
      if (!post) {
        return Promise.reject(null)
      }
      return res.status(200).jsonp({ ...post.toObject(), category: body.category }).end()
    })
    .catch((err) => res.status(400).jsonp({ message: err || 'post creation failed' }).end())
}

function updatePost (req, res) {
  const body = req.body || {}
  const post = req.post

  return Promise.resolve(body)
    .then(body => {
      // category replaced
      if (body.category !== req.category.path) {
        return getCategoryIdByPath(body.category).then(id => {
          body.category = id
          return body
        })
      }
      delete body.category
      return body
    })
    .then(body => Object.assign(post, body))
    .then(post => post.update())
    .then(post => {
      return res.status(200).jsonp(getDisplayPost(post, req.category)).end()
    })
    .catch(() => res.status(400).jsonp({ message: 'post update failed' }).end())
}

function removePost (req, res) {
  const post = req.post

  return post.remove()
    .then(post => {
      return res.status(200).jsonp(getDisplayPost(post, req.category)).end()
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
