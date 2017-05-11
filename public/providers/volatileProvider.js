/* global localStorage io provider user */
console.log(window.location.href, '4')
var socket = io(window.location.href)
socket.on('connect', function () {
  console.log('connected as', socket.id)
  // TODO make a proper init so we dont need to override funcs
  provider.sendToIo = function (msgs) {
    console.log(msgs)
    socket.emit('message:send', msgs)
  }
  provider.getBox = function (usr) {
    socket.emit('messages:get', usr)
  }
  provider.getBox(user)
})

var VolatileProvider = function () {
  var boxes = {}
  // placeholder functs
  var sendToIo = function () { console.log('not connected yet') }
  var getBox = function () { console.log('not connected yet') }

  function send (msg) {
    var outbox = messages(msg.from)
    var inbox = messages(msg.to)
    inbox.push(msg)
    if (msg.to.toLowerCase() !== msg.from.toLowerCase()) {
      outbox.push(msg)
    };

    provider.sendToIo(msg)
    this.receive(msg)
    return true
  };

  function reload (name) {
    for (var x in messages(name)) {
      this.receive(messages(name)[x])
    };
  };

  function messages (name) {
    if (boxes[name.toLowerCase()] === undefined) {
      boxes[name.toLowerCase()] = []
    };
    return boxes[name.toLowerCase()]
  }

  function storeLocalBox (box, msg) {
    console.log('called storeInbox')
    var arr = messages(box)
    arr.push(msg)
    localStorage.setItem(box, JSON.stringify(arr))
  };

  return {
    sendToIo: sendToIo,
    boxes: boxes,
    send: send,
    reload: reload,
    storeLocalBox: storeLocalBox,
    getBox: getBox
  }
}
