var fs = require('fs-extra')
var path = require('path')
var nstatic = require('node-static')
var debug = require('debug')('autocrypt:server')
var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var ip = require('ip')
var MakeState = require('./srvStore')
var file = new nstatic.Server('./public')
var appState = MakeState() // all CONNECTED clients socket
// debug(appState)
var port = 8090
app.listen(port)
console.log('autocrypt demo v0.0.0server is runnig http://' + ip.address() + ':' + port)

// serve static files in the public dir
function handler (req, res) {
  req.addListener('end', function () {
    file.serve(req, res)
  }).resume()
}

// socket.io connection
io.on('connection', function (socket) {
  debug('someone is connected', socket.id)
  socket.on('msgs', function (data) {
    appState[data.user] = {
      inbox: data.inbox,
      outbox: data.outbox
    }
    writeUser(data.user, appState)
    // debug('state', appState)
  })
  socket.on('messages:get', function (user) {
    if (appState[user]) console.log('user', user, appState[user])
    else debug('no user named', user)
  })
})

function writeUser (user, state) {
  debug('write JSON msgs for ', user)
  if (!state[user]) return console.log('no data')
  var fPath = path.join(__dirname, 'msgs', user + '.json')
  fs.outputJson(fPath, state[user], err => {
    if (err) return console.error(err)
    debug('msgs written:', fPath)
  })
}
