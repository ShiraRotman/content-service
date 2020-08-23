const authErr = '{"message":"you are not authorized"}'

function onlyAuthenticated (req, res, next) {
  if (!req.user) {
    return res.status(401).set('Content-Type', 'application/json').end(authErr);
  }
  next()
}

function onlyEditor (req, res, next) {
  if (!(req.user && req.user.isEditor)) {
    return res.status(401).set('Content-Type', 'application/json').end(authErr);
  }
  next()
}

function onlyAdmin (req, res, next) {
  if (!(req.user && req.user.isAdmin)) {
    return res.status(401).set('Content-Type', 'application/json').end(authErr);
  }
  next()
}

module.exports = {
  onlyAuthenticated,
  onlyEditor,
  onlyAdmin
}
