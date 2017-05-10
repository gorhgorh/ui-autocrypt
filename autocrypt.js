/* globals  localStorageProvider autocrypt storage messages */
// javascript implementation of essential Autocrypt UI

var provider = localStorageProvider

var user = 'User'

// setup during initialization
var ui = {}

var replying_to

function setup_page () {
  ui = userInterface()
  ui.setup()

  switchuser(Object.keys(storage)[0])
  ui.pane('list')
  ui.update_description()
};

var autocrypt_switch = function (enabled) {
  autocrypt['enabled'] = enabled
  if (enabled) {
    if (autocrypt['key'] === undefined) { autocrypt['key'] = String(Math.random()) }
  }
  self_sync_autocrypt_state()
}

var self_sync_autocrypt_state = function () {
  if (autocrypt['enabled']) {
    autocrypt['state'][user] = {
      'date': new Date(),
      'key': autocrypt['key'],
      'prefer-encrypted': autocrypt['prefer-encrypted']
    }
  } else {
    autocrypt['state'][user] = {
      'date': new Date()
    }
  }
}

var changeuser = function () {
  var names = Object.keys(storage)
  var index = -1
  for (var x in names) {
    if (names[x] == user) {
      index = x
    }
  }
  var newindex = (Number(index) + 1) % (names.length)
  switchuser(names[newindex])
  return false
}

var switchuser = function (name) {
  user = name
  autocrypt = storage[name]['autocrypt']
  messages = []
  provider.reload(name)
  ui.switchuser(name)
}

var adduser = function (username, color) {
  lc = username.toLowerCase()
  if (storage[lc] == undefined) {
    storage[lc] = {
      'name': username,
      'color': color,
      'autocrypt': {
        'enabled': false,
        'state': {}
      }
    }
  }
}

var autocryptheader = function () {
  if (autocrypt['enabled'] == false) { return undefined }
  return { 'key': autocrypt['key'],
    'prefer-encrypted': autocrypt['prefer-encrypted']
  }
}

var indent = function (str) {
  return str.split('\n').map(function (y) { return '> ' + y }).join('\n')
}

var addmail = function (to, subj, body, encrypted) {
  var msg = { 'from': storage[user]['name'],
    'to': to,
    'subject': subj,
    'body': body,
    'encrypted': encrypted,
    'autocrypt': autocryptheader(),
    'date': new Date()
  }
  provider.send(msg)
  return true
}

provider.receive = function (msg) {
  acupdate(msg)
  messages.push(msg)
}

var getacforpeer = function (peer) {
  var ac = autocrypt['state'][peer.toLowerCase()]

  if (ac === undefined) { ac = { 'date': new Date('1970') } }
  return ac
}

var acupdate = function (msg) {
  var peer = msg['from']
  var ac = getacforpeer(peer)
  var newac = {
    'date': msg['date']
  }
  if (msg['autocrypt'] === undefined) {
  } else {
    newac['prefer-encrypted'] = msg['autocrypt']['prefer-encrypted']
    newac['key'] = msg['autocrypt']['key']
  }
  if (ac['date'].getTime() < newac['date'].getTime()) {
    autocrypt['state'][peer.toLowerCase()] = newac
  }
}

function resetClient () {
    // client state for all clients is stored here:
  storage = {}

    // messages for the current user
  messages = []

    // autocrypt state for the current user
  autocrypt = {}
  adduser('Alice', 'green')
  adduser('Bob', 'darkorange')
};

resetClient()
