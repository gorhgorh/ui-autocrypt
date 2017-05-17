/* entry point for the browerify bundle */
console.log('autoUi, 0.0.1')
if (typeof module === 'object' && module.exports) {
  var getDom = require('./lib/dom.js')
  var getDomElements = getDom.getDomElements
  var getPanes = getDom.getPanes
}


function setupPage () {
  console.log('initCalled')
  var acu = {}
  acu.dom = getDomElements()
  acu.panes = getPanes()
  window.acu = acu
}


// exports the module if in a common.js env
if (typeof module === 'object' && module.exports) {
  module.exports = setupPage
} else {
  window.setupPage = setupPage
}
// call setupPage when page is loaded
document.addEventListener('DOMContentLoaded', setupPage, false)
