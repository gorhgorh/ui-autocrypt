var fs = require('fs-extra')
var path = require('path')
var nstatic = require('node-static')
var debug = require('debug')('autocrypt:server')
var ip = require('ip')

var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var file = new nstatic.Server('./public')

var MakeState = require('./srvStore')
var appState = MakeState() // get json message
// debug(appState.alice)

var port = 8090
app.listen(port)
console.log('autocrypt demo v0.0.1 server is runnig http://' + ip.address() + ':' + port)

// serve static files in the public dir
function handler (req, res) {
  req.addListener('end', function () {
    file.serve(req, res)
  }).resume()
}

// socket.io connection
io.on('connection', function (socket) {
  var currRoom

  debug('someone is connected', socket.id)
  socket.on('message:send', function (msg) {
    debug(msg)
    addMsgToState(msg, appState)
    // debug(appState)
    writeUsers(appState)
    // writeUser(msgs.user, appState)
    // debug('state', appState)
  })

  socket.on('user:switch', function (user) {
    if (currRoom !== undefined) socket.leave(currRoom)
    socket.join(user)
    currRoom = user
  })

  socket.on('messages:get', function (user) {
    if (appState[user]) {
      debug('messages:get', user)
    } else {
      debug('no user named', user)
      newUser(user, appState)
      debug('userState', appState[user])
    }
  })
})

function writeUsers (state) {
  var users = Object.keys(state)
  users.map(function (user) {
    var uName = user.toLowerCase()
    var fPath = path.join(__dirname, 'msgs', uName + '.json')
    fs.outputJson(fPath, state[uName], err => {
      if (err) return console.error(err)
      debug('msgs written:', fPath)
    })
  })
}

// function writeUser (user, state) {
//   debug('write JSON msgs for ', user)
//   if (!state[user]) return console.log('no data')
//   var fPath = path.join(__dirname, 'msgs', user + '.json')
//   fs.outputJson(fPath, state[user], err => {
//     if (err) return console.error(err)
//     debug('msgs written:', fPath)
//   })
// }

function newUser (user, state) {
  state[user] = {inbox: [], outbox: []}
  return state
}

function addMsgToState (msg, state) {
  addInboxMsg(msg, state)
  addOutboxMsg(msg, state)
  debug(state)
}

function addInboxMsg (msg, state) {
  var to = msg.to.toLowerCase()
  if (!state[to]) newUser(to, state)
  state[to].inbox.push(msg)
}

function addOutboxMsg (msg, state) {
  var from = msg.from.toLowerCase()
  if (!state[from]) newUser(from, state)
  state[from].outbox.push(msg)
}
