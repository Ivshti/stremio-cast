var fetch = typeof (window) !== 'undefined' ? window.fetch : require('node-fetch')
var events = require('events')

var POLL_INTERVAL = 1000

function Client (url) {
  var self = new events.EventEmitter()

  self.initialized = false

  var status = { } // last state received from server
  var modified = { } // properties which we've modified, that have to be pushed to the server

  var timer = null // debounce timer

  var props = ['volume', 'time', 'paused', 'state', 'length', 'source']
  props.forEach(function (p) {
    Object.defineProperty(self, p, {
      get: function () { return modified.hasOwnProperty(p) ? modified[p] : status[p] },
      set: function (v) {
        modified[p] = v
        resetTimer(50) // do a sync in 50ms
      }
    })
  })

  self.play = function (src) { self.source = src }
  self.stop = function () { self.source = null }

  function sync () {
    var p = fetch(url + '/player', { method: 'POST', body: JSON.stringify(modified), headers: { 'content-type': 'application/json' } })
    modified = { }

    p.then(function (res) { return res.json() })
    .then(function (resp) {
      sendEvs(status, resp) // compare old status vs new and send events if we have to
      status = resp // server must send back full status
      resetTimer() // trigger sync after POLL_INTERVAL
    })
  }

  function resetTimer (t) {
    clearTimeout(timer)
    timer = self.source ? setTimeout(sync, t || POLL_INTERVAL) : null
  }

  function sendEvs (old, current) {

  }

  // TODO function init() which pulls /manifest

  return self
}

module.exports = Client
