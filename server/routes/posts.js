module.exports = function (app) {
  const populateUser = require('../middleware/populate-user')
  const { onlyEditor } = require('../middleware/auth-check')

  const { getCategoryByPath } = require('../controllers/categories')

  const {
    getPostById,
    getPostsList, createPost, getPostByPath, getPost,
    updatePost,
    removePost
  } = require('../controllers/posts')

  // posts routes - from category and from posts directly
  app
    .get('/api/categories/:categoryPath/posts', populateUser, getCategoryByPath, getPostsList)
    .post('/api/categories/:categoryPath/posts', populateUser, onlyEditor, getCategoryByPath, createPost)
    .get('/api/categories/:categoryPath/posts/:postPath', getCategoryByPath, getPostByPath, getPost)
    .put('/api/categories/:categoryPath/posts/:postPath', populateUser, onlyEditor, getCategoryByPath, getPostByPath, updatePost)
    .delete('/api/categories/:categoryPath/posts/postPath', populateUser, onlyEditor, getCategoryByPath, getPostByPath, removePost)
  app
    .get('/api/posts', populateUser, getPostsList)
    .post('/api/posts', populateUser, onlyEditor, createPost)
    .get('/api/posts/:postId', populateUser, onlyEditor, getPostById, getPost)
    .get('/api/posts/:categoryPath/:postPath', getCategoryByPath, getPostByPath, getPost)
    .put('/api/posts/:categoryPath/:postPath', populateUser, onlyEditor, getCategoryByPath, getPostByPath, updatePost)
    .delete('/api/categories/:categoryPath/postPath', populateUser, onlyEditor, getCategoryByPath, getPostByPath, removePost)

}
