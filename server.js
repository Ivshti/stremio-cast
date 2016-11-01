var PROPS = ['volume', 'time', 'paused', 'state', 'length', 'source', 'mediaSessionId', 'subtitlesSrc']

function Server (player, manifest) {
  return function (req, res, next) {
    if (!req.body) return res.end(400)

    // TODO: manifest
    var modifications = req.body || { }
    var subs = modifications.subtitlesSrc || player.subtitlesSrc
    
    Object.keys(modifications).forEach(function (k) {
      if (k === 'source') modifications.source ? player.play(modifications.source, subs) : player.stop()
      if (modifications[k] !== player[k]) player[k] = modifications[k]
    });

    (function(next) {
      if (player.update) player.update(next) // request fresh status for the next call
      else next()
    })(function() {
      var status = { }
      PROPS.forEach(function (k) { status[k] = player[k] })
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(status))
    })
  }
}

module.exports = Server
