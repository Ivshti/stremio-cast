var fetch = typeof (window) !== 'undefined' ? window.fetch : require('node-fetch')
var events = require('events')

var POLL_INTERVAL = 1000
var STATES = { NothingSpecial: 0, Opening: 1, Buffering: 2, Playing: 3, Paused: 4, Stopped: 5, Ended: 6, Error: 7 }
var PROPS = ['volume', 'time', 'paused', 'state', 'length']

function Client (url) {
  var self = new events.EventEmitter()

  self.initialized = false

  var status = { } // last state received from server
  var modified = { } // properties which we've modified, that have to be pushed to the server

  var timer = null // next sync timer

  PROPS.forEach(function (p) {
    Object.defineProperty(self, p, {
      get: function () { return modified.hasOwnProperty(p) ? modified[p] : status[p] },
      set: function (v) {
        modified[p] = v
        resetTimer(50) // do a sync in 50ms
        if (p === 'volume') self.emit('volumechanged')
        if (p === 'time') self.emit('seeking')
      }
    })
  })

  self.play = function (src) { self.source = modified.source = src; resetTimer(50) }
  self.stop = function () { self.source = modified.source = null; resetTimer(50) }

  function sync () {
    var p = fetch(url, { method: 'POST', body: JSON.stringify(modified), headers: { 'content-type': 'application/json' } })
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
    if (current.state === STATES.Buffering) self.emit('buffering', { buf: 0 })
    if (old.state <= STATES.Opening && current.state > STATES.Opening && current.state < STATES.Stopped) self.emit('loaded', { duration: current.length })
    if (current.state === STATES.Error) self.emit('error', { err: current.error })
    if (current.state !== old.state) self.emit('statechanged', { state: current.state })
    if (current.time !== old.time) self.emit('timeupdate', { time: current.time })
  }

  // TODO function init() which pulls /manifest

  return self
}

module.exports = Client
