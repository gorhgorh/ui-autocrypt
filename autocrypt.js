/* globals  localStorageProvider autocrypt storage messages userInterface users */
// javascript implementation of essential Autocrypt UI

var provider = localStorageProvider

// setup during initialization
var ui = {}
var us

function setupPage () {
  ui = userInterface()
  ui.setup()

  changeUser('Alice')
  ui.pane('list')
  ui.updateDescription()
};

var autocryptSwitch = function (isEnabled) {
  autocrypt.enabled = isEnabled
  if (isEnabled) {
    if (autocrypt.key === undefined) { autocrypt.key = String(Math.random()) }
  }
  selfSyncAutocryptState()
}

var selfSyncAutocryptState = function () {
  if (autocrypt.enabled) {
    autocrypt.state[us.current().id] = {
      date: new Date(),
      key: autocrypt.key,
      preferEncrypted: autocrypt.preferEncrypted
    }
  } else {
    autocrypt.state[us.current().id] = {
      'date': new Date()
    }
  }
}

var changeUser = function (name) {
  if (name) {
    us.select(name)
    }
  else {
    us.next()
  }
  switchuser(us.current())
  return false
}

var switchuser = function (user) {
  autocrypt = storage[user.id]
  messages = []
  provider.reload(user.id)
  ui.switchuser(user)
}

var adduser = function (name, color) {
  us.add(name, color)
  var id = name.toLowerCase()
  if (storage[id] === undefined) {
    storage[id] = {
      enabled: false,
      state: {}
    }
  }
}

var autocryptheader = function () {
  if (autocrypt.enabled === false) { return undefined }
  return { 'key': autocrypt['key'],
    'preferEncrypted': autocrypt['preferEncrypted']
  }
}

var addmail = function (to, subj, body, encrypted) {
  var msg = {
    from: us.current().name,
    to: to,
    subject: subj,
    body: body,
    encrypted: encrypted,
    autocrypt: autocryptheader(),
    date: new Date()
  }
  provider.send(msg)
  return true
}

provider.receive = function (msg) {
  acupdate(msg)
  messages.push(msg)
}

var getacforpeer = function (peer) {
  var ac = autocrypt.state[peer.toLowerCase()]

  if (ac === undefined) { ac = { 'date': new Date('1970') } }
  return ac
}

var acupdate = function (msg) {
  var peer = msg.from
  var ac = getacforpeer(peer)
  var newac = {
    'date': msg.date
  }
  if (msg.autocrypt === undefined) {
    // TODO remove
  } else {
    newac.preferEncrypted = msg['autocrypt']['preferEncrypted']
    newac.key = msg['autocrypt']['key']
  }
  if (ac.date.getTime() < newac.date.getTime()) {
    autocrypt.state[peer.toLowerCase()] = newac
  }
}

function resetClient () {
    // client state for all clients is stored here:
  storage = {}

    // messages for the current user
  messages = []

    // autocrypt state for the current user
  autocrypt = {}

  us = users()
  adduser('Alice', 'green')
  adduser('Bob', 'darkorange')
};

resetClient()
