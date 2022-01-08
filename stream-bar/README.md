# skate's Bundles: stream-bar

This bundles shows stream meta information like current song playing and last sub in a bar visible in the stream.

## Features

* Retrieves and display stream meta information in a NodeCG graphic webpage.
    * Stream meta information includes: Last subscriber, tip, cheer and sub bomb. Also contains the currently playing song and an ad for [merch](https://shop.skate702.de)
    * Only meta information that is currently relevant is displayed
* A chat bot answers what song is currently playing when asked `!song`

## Service Dependencies

* [spotify](https://nodecg.io/DEV/samples/spotify/) (requires an [app](https://developer.spotify.com/dashboard/applications), scopes: `user-read-currently-playing`, `user-read-playback-state`)
* [streamelements](https://nodecg.io/DEV/samples/streamelements/) (requires a [jwt token](https://streamelements.com/dashboard/account/channels))
* [twitch-chat](https://nodecg.io/DEV/samples/twitch-chat/) (requires [oauth](https://twitchapps.com/tmi/))

## Custom Installation

This bundles provides NodeCG graphics that can be queried by using the `Graphics` tab of NodeCG.