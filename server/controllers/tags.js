const Post = require('mongoose').model('Post')

const LIMIT = 30
const MAX_LIMIT = 300

let _cachedTags

setInterval(() => _cachedTags = null, 1000 * 60 * 60)

function sendTags (res) {
  res.status(200)
  res.set('Content-Type', 'application/json; utf-8')
  res.end(_cachedTags)
}

function getTagsList (req, res) {
  if (_cachedTags && _cachedTags.length) {
    return sendTags(res)
  }

  return Post.aggregate([
    { $project: { tags: 1 } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ])
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }
      _cachedTags = JSON.stringify(list)
      return sendTags(res)
    })
    .catch(() => res.status(401).jsonp({ message: 'failed to load tags list' }).end())
}

function getPostsByTag (req, res) {
  const reqQuery = req.query || {}

  const limit = parseInt(reqQuery.limit) || LIMIT
  const offset = parseInt(reqQuery.offset) || 0

  return Post
    .find({ tags: req.params.tag })
    .select('-content')
    .sort({ created: -1 })
    .populate('category', 'path name')
    .limit(limit > MAX_LIMIT ? MAX_LIMIT : limit)
    .skip(offset)
    .lean()
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }

      return res.status(200).jsonp(list).end()
    })
    .catch(() => res.status(401).jsonp({ message: 'failed to load posts list' }).end())
}

module.exports = {
  getTagsList,
  getPostsByTag
}
