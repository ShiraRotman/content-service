function onlyAuthenticated (req, res) {
  if (!req.user) {
    return res.status(401).jsonp({ message: 'you are not authorized' }).end()
  }
}

function onlyEditor (req, res) {
  if (!(req.user && req.user.isEditor)) {
    return res.status(401).jsonp({ message: 'you are not authorized' }).end()
  }
}

module.exports = {
  onlyAuthenticated,
  onlyEditor
}
