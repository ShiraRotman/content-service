const Menu = require('../models/menu')
const cacheManager = require('../utils/cache-manager')

const cachePrefix = 'menu:'

const categoryPopulation = {
  path: 'links.category',
  select: 'path name _id'
}

function getCachedMenu (req, res, next) {
  const menuName = req.params.menuName
  cacheManager.get(cachePrefix + menuName).then(menu => {
    if (menu) {
      res.status(200).set('Content-Type', 'application/json').end(menu)
    } else {
      next()
    }
  }).catch(() => next())
}

function setCachedMenu (menu) {
  cacheManager.set(cachePrefix + menu.name, JSON.stringify(menu.toObject ? menu.toObject() : menu))
}

function populateMenu (menu) {
  return menu
    .populate(categoryPopulation)
    .populate({
      path: 'links.post',
      select: 'path category _id title',
      populate: {
        path: 'category',
        select: 'path _id'
      }
    })
}

function getMenuByName (req, res, next) {
  populateMenu(Menu.findOne({ name: req.params.menuName })).then(menu => {
    if (!menu) {
      return Promise.reject(null)
    }
    req.menu = menu
    setCachedMenu(menu)
    next()
  }).catch(() => res.status(404).jsonp({ message: 'menu not exists' }).end())
}

function getMenusList (req, res) {
  return Menu.distinct('name')
    .then(list => {
      if (!list) {
        return Promise.reject(null)
      }
      return res.status(200).jsonp(list).end()
    })
    .catch(() => res.status(400).jsonp({ message: 'failed to load menus list' }).end())
}

function getMenu (req, res) {
  return res.status(200).jsonp(req.menu).end()
}

function createMenu (req, res) {
  const body = req.body || {}

  if (!(body.links && body.links instanceof Array)) {
    res.status(400).jsonp({ message: 'menu links are missing' }).end()
    return
  }

  const menu = new Menu({
    name: body.name,
    links: flattenLinks(body.links),
  })

  saveAndPopulate(menu).then((menu) => {
    if (!menu) {
      return Promise.reject(null)
    }
    return res.status(200).jsonp(menu).end()
  })
    .catch(() => res.status(400).jsonp({ message: 'menu creation failed' }).end())
}

function updateMenu (req, res) {
  const body = req.body || {}
  const menu = req.menu

  if (menu.name !== body.name) {
    menu.name = body.name
  }
  menu.links = flattenLinks(body.links)

  saveAndPopulate(menu).then((menu) => {
    if (!menu) {
      return Promise.reject(null)
    }
    return res.status(200).jsonp(menu).end()
  })
    .catch(() => res.status(400).jsonp({ message: 'menu update failed' }).end())
}

function removeMenu (req, res) {
  const menu = req.menu

  menu.remove().then(menu => {
    return res.status(200).jsonp(menu).end()
  })
    .catch(() => res.status(400).jsonp({ message: 'menu remove failed' }).end())
}

function saveAndPopulate (menu) {
  return menu.save()
    .then(menu => {
      if (!menu) {
        return Promise.reject(null)
      }
      return populateMenu(Menu.findOne({ name: menu.name }))
    })
}

function flattenLinks (links = []) {
  let newLinks = []

  links.forEach((l) => {
    if (!(l && l.kind)) {
      return
    }
    let link = { kind: l.kind, _id: l._id }
    switch (l.kind) {
    case 'category':
      link.category = l.value || (l.category || {})._id || l.category
      break
    case 'post':
      link.post = l.value || (l.post || {})._id || l.post
      break
    case 'http':
      link.value = l.value
      break
    default:
      return
    }

    newLinks.push(link)
  })
  return newLinks
}

module.exports = {
  getMenuByName,
  getMenusList,
  getMenu,
  createMenu,
  updateMenu,
  removeMenu,
  getCachedMenu
}
