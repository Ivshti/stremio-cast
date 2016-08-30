# Stremio Cast

## Abstract protocol over HTTP for communicating with a media player

### Use cases:

* Casting / remote control (Chromecast-style) to a DIY media center
* Unified interface to different casting protocols (Chromecast, DLNA, Airplay)
* Simple, easy to understand and implement alternative to complex protocols like castv2 or DLNA

## Properties 

**These properties are used to describe player state, which goes two ways - a POST to the stremiocast endpoint can set any of these properties, and a GET on the endpoint would return a full description of the player state using those properties**

* `source` - read/write - url to media source; set this to begin playback
* `volume` - read/write - player volume, from 0 to 1 
* `time` - read/write - current player time; use this to seek 
* `paused` - read/write - whether the playback is paused
* `state` - read - current player state; 0 - idle, 1 - opening, 2 - buffering, 3 - playing, 4 - paused, 5 - stopped, 6 - ended, 7 - error
* `length` - read - time length of current media

**DISCLAIMER** This does not pretend to be an alternative of existing protocols, such as DLNA and castv2. It's merely something similar designed with extreme simplicity in mind over HTTP and JSON.

