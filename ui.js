/* global messages addmail confirm client user us */
console.log('ui v0.0.6')

function userInterface () {
  var dom = {}
  var panes = uiPanes()

  function getElements() {
    collection = {}
    for (id of arguments) {
      collection[id] = document.getElementById(id)
    }
    return collection
  }

  // run when the dom is loaded
  function setup (event) {
    dom = getElements('more', 'listReplacement', 'msgtable',
        'username', 'from', 'to', 'subject', 'body', 'msglist',
        'viewFrom', 'viewTo', 'viewSubject', 'viewDate', 'viewBody', 'viewEncrypted',
        'encrypted', 'encryptedRow', 'showmore', 'reply', 'yes', 'no', 'enable',
        'description', 'explanation', 'settings')

    dom.encrypted.parentNode.insertBefore(img('lock'), dom.encrypted)

    panes.setup()

    document.getElementById('compose').addEventListener("selected", function (e) {
      dom.to.focus()
      updatecompose()
    })
    document.getElementById('list').addEventListener("selected", function (e) {
      populateList()
      clearcompose()
    })

    changeUser('Alice')
    panes.select('list')
    updateDescription()
  }

  function clearcompose () {
    dom.to.value = ''
    dom.body.value = ''
    dom.subject.value = ''
    dom.encrypted.checked = false
  }

  function showMsg (msg) {
    dom.viewFrom.innerText = msg['from']
    dom.viewTo.innerText = msg['to']
    dom.viewSubject.innerText = msg['subject']
    dom.viewDate.innerText = msg['date']
    dom.viewEncrypted.replaceChild(getEncryptionStatusNode(msg.encrypted), dom.viewEncrypted.childNodes[0])
    dom.viewBody.innerText = msg['body']
    // fix before refactor
    var usr = us.current()
    if (msg.from === usr.name) {
      dom.reply.style.display = 'none'
    } else {
      dom.reply.style.display = 'inline'
      dom.reply.onclick = function () { replyToMsg(msg) }
    }

    panes.select('msgView')
  }

  function replyToMsg (msg) {
    function indent (str) {
      return str.split('\n').map(function (y) { return '> ' + y }).join('\n')
    }

    dom.to.value = msg.from
    dom.subject.value = 'Re: ' + msg.subject
    dom.body.value = indent(msg.body)
    panes.select('compose')
    dom.encrypted.checked = dom.encrypted.checked || msg.encrypted
  }

  function populateList () {
    while (dom.msglist.hasChildNodes()) { dom.msglist.removeChild(dom.msglist.lastChild) }

    if (messages.length) {
      for (var x in messages) {
        dom.msglist.appendChild(generateListEntryFromMsg(messages[x]))
      }
      dom.listReplacement.style.display = 'none'
      dom.msgtable.style.display = 'table'
    } else {
      dom.listReplacement.style.display = 'block'
      dom.msgtable.style.display = 'none'
    }
  }

  function sendmail () {
    if (addmail(dom.to.value, dom.subject.value, dom.body.value, dom.encrypted.checked)) {
      clearcompose()
      panes.select('list')
      return false
    } else {
      return false
    }
  }

  function updatecompose () {
    var to = dom.to.value
    var ac = client.getPeerAc(to)

    if (!client.isEnabled()) {
      if (ac.preferEncrypted) {
        dom.encryptedRow.style.display = 'table-row'
        dom.encrypted.checked = false
        enablecheckbox(dom.encrypted, true)
        dom.explanation.innerText = 'enable Autocrypt to encrypt'
      } else {
        dom.encryptedRow.style.display = 'none'
      }
    } else {
      dom.encryptedRow.style.display = 'table-row'
      if (ac.key !== undefined) {
        dom.encrypted.checked = ac.preferEncrypted
        enablecheckbox(dom.encrypted, true)
        dom.explanation.innerText = ''
      } else {
        dom.encrypted.checked = false
        enablecheckbox(dom.encrypted, false)
        if (to === '') { dom.explanation.innerText = 'please choose a recipient' } else { dom.explanation.innerText = 'If you want to encrypt to ' + to + ', ask ' + to + ' to enable Autocrypt and send you an e-mail' }
      }
    }
  }

  function clickencrypted () {
    var to = dom.to.value
    var ac = client.getPeerAc(to)
    var encrypted = dom.encrypted.checked

    // FIXME: if autocrypt is disabled and we've set encrypt, prompt the user about it.
    if (encrypted && client.isEnabled === false) {
      if (confirm('Please only enable Autocrypt on one device.\n\n' +
          'Are you sure you want to enable Autocrypt on this device?')) {
        client.enable(true)
        setupprefs()
        updateDescription()
      } else {
        dom.encrypted.checked = false
        encrypted = false
      }
    }
    if (!client.isEnabled && !dom.encrypted.disabled) {
      dom.explanation.innerText = 'enable Autocrypt to encrypt'
    } else if (encrypted && ac.preferEncrypted === false) {
      dom.explanation.innerText = to + ' prefers to receive unencrypted mail.  It might be hard for them to read.'
    } else if (!encrypted && ac.preferEncrypted === true) {
      dom.explanation.innerText = to + ' prefers to receive encrypted mail!'
    } else {
      dom.explanation.innerText = ''
    }
  }

  function more () {
    dom.showmore.checked = !dom.showmore.checked
    updateDescription()
    return false
  }

  function getDescription () {
    if (!dom.enable.checked) {
      return 'Autocrypt is disabled on this device.'
    }
    if (dom.yes.checked) {
      return 'Autocrypt will encourage your peers to send you encrypted mail.'
    }
    if (dom.no.checked) {
      return 'Autocrypt will discourage your peers from sending you encrypted mail.'
    }
    return 'Autocrypt lets your peers choose whether to send you encrypted mail.'
  }

  function autocryptPreference (p) {
    var other
    if (p === 'yes') {
      other = 'no'
    } else {
      other = 'yes'
      p = 'no'
    }
    dom[other].checked = false
    if (dom.yes.checked) {
      client.autocrypt.preferEncrypted = true
    } else if (dom.no.checked) {
      client.autocrypt.preferEncrypted = false
    } else {
      delete client.autocrypt.preferEncrypted
    }
    console.log('prefer encrypted set to:', client.autocrypt.preferEncrypted)
    client.selfSyncAutocryptState()
    updateDescription()
  }

  function autocryptEnable () {
    client.enable(dom.enable.checked)
    updateDescription()
  }

  function enablecheckbox (box, enabled) {
    box.disabled = !enabled
    if (enabled) { box.parentElement.classList.remove('disabled') } else { box.parentElement.classList.add('disabled') }
  }

  function updateDescription () {
    var disabled = !dom['enable'].checked
    dom.yes.disabled = disabled
    dom.no.disabled = disabled
    if (dom.showmore.checked) {
      dom.settings.style.display = 'block'
      dom.showmore.innerText = 'Hide Advanced Settings'
    } else {
      dom.settings.style.display = 'none'
      dom.showmore.innerText = 'Advanced Settings...'
    }
    if (disabled) {
      dom.yes.parentElement.classList.add('disabled')
      dom.no.parentElement.classList.add('disabled')
      dom.more.style.display = 'none'
    } else {
      dom.yes.parentElement.classList.remove('disabled')
      dom.no.parentElement.classList.remove('disabled')
      dom.more.style.display = 'block'
    }
    dom.description.innerText = getDescription()
  }

  function switchuser (user) {
    dom.username.innerText = user.name
    dom.username.style.color = user.color
    dom.from.innerText = user.name
    setupprefs()
    dom.showmore.checked = false
    panes.select('list')
    updateDescription()
  }

  function setupprefs () {
    dom.enable.checked = client.isEnabled()
    if (client.autocrypt.preferEncrypted === undefined) {
      dom.yes.checked = false
      dom.no.checked = false
    } else if (client.autocrypt.preferEncrypted === true) {
      dom.yes.checked = true
      dom.no.checked = false
    } else if (client.autocrypt.preferEncrypted === false) {
      dom.yes.checked = false
      dom.no.checked = true
    }
  }

  function getEncryptionStatusNode (encrypted) {
    var x = document.createElement('span')
    if (encrypted) {
      var sub = document.createElement('span')
      x.appendChild(img('lock'))
      sub.innerText = 'Message was encrypted'
      x.appendChild(sub)
    } else {
      x.innerText = 'Message was not encrypted'
    }

    return x
  }

  function generateListEntryFromMsg (msg) {
    var ret = document.createElement('tr')
    ret.classList.add('message')
    ret.onclick = function () { showMsg(msg) }

    var e = document.createElement('td')
    if (msg['encrypted']) { e.appendChild(img('lock')) }
    if (msg['to'].toLowerCase() === dom.username.innerText.toLowerCase()) {
      e.appendChild(img('back'))
    }
    if (msg['from'].toLowerCase() === dom.username.innerText.toLowerCase()) {
      e.appendChild(img('forward'))
    }
    ret.appendChild(e)

    var f = document.createElement('td')
    f.innerText = msg['from']
    ret.appendChild(f)

    var t = document.createElement('td')
    t.innerText = msg['to']
    ret.appendChild(t)

    var s = document.createElement('td')
    s.innerText = msg['subject']
    ret.appendChild(s)

    var d = document.createElement('td')
    d.innerText = msg['date']
    ret.appendChild(d)

    return ret
  }

  function img (what) {
    var index = {
      lock: 'assets/images/emblem-readonly.png',
      back: 'assets/images/back.png',
      forward: 'assets/images/forward.png'
    }
    var lock = document.createElement('img')
    lock.src = index[what]
    return lock
  }

  document.addEventListener("DOMContentLoaded", setup)

  return {
    setup: setup,
    updateDescription: updateDescription,
    switchuser: switchuser,
    updatecompose: updatecompose,
    autocryptEnable: autocryptEnable,
    autocryptPreference: autocryptPreference,
    clickencrypted: clickencrypted,
    more: more,
    sendmail: sendmail
  }
}

function why () {
  console.log('why placeholder')
}

// exports the module if in a common.js env
if (typeof module === 'object' && module.exports) {
  module.exports = userInterface
} else {
  window.userInterface = userInterface
}
