/* globals  localStorageProvider messages userInterface users clients */
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
  client.enable(isEnabled)
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
  client = cs.get(user.id)
  messages = []
  provider.reload(user.id)
  ui.switchuser(user)
}

var adduser = function (name, color) {
  us.add(name, color)
}

var addmail = function (to, subj, body, encrypted) {
  var msg = {
    from: us.current().name,
    to: to,
    subject: subj,
    body: body,
    encrypted: encrypted,
    autocrypt: client.makeHeader(),
    date: new Date()
  }
  provider.send(msg)
  return true
}

provider.receive = function (msg) {
  client.processIncoming(msg)
  messages.push(msg)
}

function resetClient () {
    // messages for the current user
  messages = []

  us = users()
  adduser('Alice', 'green')
  adduser('Bob', 'darkorange')

  cs = clients()
};

resetClient()
