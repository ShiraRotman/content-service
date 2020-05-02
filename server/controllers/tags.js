const Post = require('../models/post')
const cacheManager = require('../utils/cache-manager')

const cachePrefix = 'tags:'

const LIMIT = 30
const MAX_LIMIT = 300

const TAGS_AGGREGATION_QUERY = [
  { $project: { tags: 1 } },
  { $unwind: '$tags' },
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 20 }
]

function getTagsList (req, res) {
  cacheManager.wrap(
    cachePrefix + 'all',
    () => Post.aggregate(TAGS_AGGREGATION_QUERY)
      .then(tags => JSON.stringify(tags))
  )
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }
      res.status(200)
      res.set('Content-Type', 'application/json')
      res.end(list)
    })
    .catch(() => res.status(401).jsonp({ message: 'failed to load tags list' }).end())
}

function getPostsByTag (req, res) {
  const reqQuery = req.query || {}

  const limit = parseInt(reqQuery.limit) || LIMIT
  const offset = parseInt(reqQuery.offset) || 0

  cacheManager.wrap(
    `${cachePrefix}postByTags:${req.params.tag}.${limit}.${offset}`,
    () => Post
      .find({ tags: req.params.tag })
      .select('-content')
      .sort({ created: -1 })
      .populate('category', 'path name')
      .limit(limit > MAX_LIMIT ? MAX_LIMIT : limit)
      .skip(offset)
      .lean()
  )
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
