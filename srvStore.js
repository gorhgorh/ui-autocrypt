/**
 * create the basic store that will be used by the socket server
 */
var debug = require('debug')('autocrypt:makeStore')
var klawSync = require('klaw-sync')
var path = require('path')
var fs = require('fs-extra')
var usersPath
var msgPath = './msgs'
try {
  // walk throug the msgs dir and return all filepath
  usersPath = klawSync(msgPath, {nodir: true})
} catch (er) {
  fs.ensureDirSync(msgPath)
  usersPath = []
}

function MakeStore () {
  // no files return a blank state
  if (usersPath.length < 1) return {}

  // map the file list array an loads the json data in the store
  var store = {}
  usersPath.map(function (file) {
    var user = path.basename(file.path, '.json')
    store[user] = fs.readJSONSync(file.path)
  })
  return store
}

module.exports = MakeStore
