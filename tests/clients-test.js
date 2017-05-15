/* unit test for clients */
/* globals clients */

(function () {
  var describe = Tests.describe

  describe('Clients', function (it, assert) {
    var client

    this.setup = function () {
      client = clients().get('me')
    }

    it('starts blank', function () {
      assert((client.makeHeader() === undefined),
          'Clients start without an autocrypt header')
    })

    it('can be enabled', function () {
      client.enable(true)
      assert((client.makeHeader() !== undefined),
          'Enabled clients has an autocrypt header')
    })

  })
})()
