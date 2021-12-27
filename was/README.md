# skate's Bundles: was

This bundle provides a chat bot and [website](https://was.skate702.de) communication, answering what (in German: "was") the streamer currently does based on the stream info.

## Features

* Stream information for every twitch category can be set by the streamer using the NodeCG dashboard
    * Stream information includes the fields `game`, `content`, `hyperlink`, `details`, `project`, `technology`, `language`, `editor`, `theme`
    * The information display handles *game-mode* (`game`, `content`/`details`, and `hyperlink` displayed) and *coding-mode* (all fields displayed)
* The chat bot replies with stream information when asked `!was`
* The stream information is sent (based on the currently streamed twitch category) to the connected database

## Service Dependencies

* [twitch-api](https://nodecg.io/DEV/samples/twitch-api/) (requires [oauth](https://twitchapps.com/tokengen/), scopes: *none*)
* [twitch-chat](https://nodecg.io/DEV/samples/twitch-chat/) (requires [oauth](https://twitchapps.com/tmi/))
* [sql](https://nodecg.io/DEV/samples/sql/)

## Custom Installation

This bundle does only push the stream info into the selected database. An appropriate database layout is required (hint: [DBController.ts](https://github.com/sebinside/skates-bundles/blob/master/was/extension/DBController.ts#L51)). The [website](https://was.skate702.de) itself is not included in this repository but could be easily build upon PHP. This is left for the gentle reader.