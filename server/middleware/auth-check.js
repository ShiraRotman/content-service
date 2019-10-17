function onlyAuthenticated (req, res, next) {
  if (!req.user) {
    return res.status(401).jsonp({ message: 'you are not authorized' }).end()
  }
  next();
}

function onlyEditor (req, res, next) {
  if (!(req.user && req.user.isEditor)) {
    return res.status(401).jsonp({ message: 'you are not authorized' }).end()
  }
  next()
}

module.exports = {
  onlyAuthenticated,
  onlyEditor
}
