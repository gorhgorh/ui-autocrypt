/* global Tests ui localStorage resetClient changeUser */
(function () {
  var describe = Tests.describe

  function enableAutocrypt () {
    ui.pane('preferences')
    document.getElementById('enable').click()
  };

  function composeTo (recipient) {
    ui.pane('compose')
    document.getElementById('to').value = recipient
    document.getElementById('to').onchange()
    document.getElementById('subject').value = 'subject'
    document.getElementById('body').value = 'body'
  };

  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  };

  function checkEncrypt () {
    document.getElementById('encrypted').click()
  };

  function send () {
    document.getElementById('send').click()
  };

  describe('Smoke test', function (it, assert) {
    function assertHasEncryptedEmail () {
      ui.pane('list')
      assert.selector('#msgtable img[src*="readonly"]')
    };

    this.setup = function () {
      localStorage.clear()
      resetClient()
      changeUser('alice')
    }

    it('autocrypts when enabled', async function () {
      changeUser('alice')
      enableAutocrypt()
      composeTo('Bob')
      send()
      changeUser('bob')
      enableAutocrypt()
      composeTo('Alice')
            // work around a firefox bug that prevents clicking an
            // element that was just enabled.
      await sleep(10)
      checkEncrypt()
      send()
      assertHasEncryptedEmail()
    })
  })
})()
