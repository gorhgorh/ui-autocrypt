function testFunc (msg) {
  if (!msg) msg = 'carammba no messages, but module works!!!'
  console.log(msg, 'yo')
}

module.exports = testFunc
