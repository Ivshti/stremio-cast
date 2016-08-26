var PROPS = ['volume', 'time', 'paused', 'state', 'length', 'source']

function Server (player, manifest) {
  return function (req, res, next) {
    // TODO: manifest
    var modifications = req.body

    Object.keys(modifications).forEach(function (k) {
      if (k === 'source') return modifications.source ? player.play(modifications.source) : player.stop()
      if (modifications[k] !== player[k]) player[k] = req.body[k]
    })

    var status = { }
    PROPS.forEach(function (k) { status[k] = player[k] })
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(status))
  }
}

module.exports = Server
