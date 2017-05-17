/* globals  localStorageProvider messages userInterface users clients client cs */
// javascript implementation of essential Autocrypt UI

var provider = localStorageProvider

var ui = userInterface()
var us = users()

var autocryptSwitch = function (isEnabled) {
  client.enable(isEnabled)
}

var changeUser = function (name) {
  if (name) {
    us.select(name)
  } else {
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
  us.add('Alice', 'green')
  us.add('Bob', 'darkorange')

  cs = clients()
};

resetClient()
