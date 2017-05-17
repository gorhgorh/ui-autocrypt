function getDomElements () {
  return {
    more: document.getElementById('more'),
    listReplacement: document.getElementById('listReplacement'),
    msgtable: document.getElementById('msgtable'),
    username: document.getElementById('username'),
    from: document.getElementById('from'),
    to: document.getElementById('to'),
    subject: document.getElementById('subject'),
    body: document.getElementById('body'),
    msglist: document.getElementById('msglist'),
    viewFrom: document.getElementById('viewFrom'),
    viewTo: document.getElementById('viewTo'),
    viewSubject: document.getElementById('viewSubject'),
    viewDate: document.getElementById('viewDate'),
    viewBody: document.getElementById('viewBody'),
    viewEncrypted: document.getElementById('viewEncrypted'),
    encrypted: document.getElementById('encrypted'),
    encryptedRow: document.getElementById('encryptedRow'),
    showmore: document.getElementById('showmore'),
    reply: document.getElementById('reply'),
    yes: document.getElementById('preferyes'),
    no: document.getElementById('preferno'),
    enable: document.getElementById('enable'),
    description: document.getElementById('description'),
    explanation: document.getElementById('explanation'),
    settings: document.getElementById('autocryptSettings')
  }
}

function getPanes () {
  return {
    compose: document.getElementById('compose'),
    list: document.getElementById('list'),
    msgView: document.getElementById('msgView'),
    preferences: document.getElementById('preferences')
  }
}

// exports the module if in a common.js env
if (typeof module === 'object' && module.exports) {
  module.exports = {
    getDomElements: getDomElements,
    getPanes: getPanes
  }
} else {
  window.getDomElements = getDomElements
  window.getPanes = getPanes
}
