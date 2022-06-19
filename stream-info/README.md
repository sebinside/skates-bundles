# skate's Bundles: stream-info

This bundle provides a chat bot and a stream overlay answering commonly asked questions about what is currently developed (in German: "was"), current goals, projects, and the programming language.

## Features

* Commonly asked questions and answers can be provided as messages
* Stream information for every twitch category and project can be set by the streamer using the NodeCG dashboard. This includes the description, a code url and a set of message ids for further commonly asked questions
* The chat bot replies with stream information when asked `!was`
* The chat bot offers several other commands including `!wer`, `!project`, `!editor`, ...
* Most of the fields are optional, *stream-info* is totally viable to be used outside of coding streams, e.g., in gaming categories

## Service Dependencies

* [twitch-api](https://nodecg.io/DEV/samples/twitch-api/) (requires [oauth](https://twitchapps.com/tokengen/), scopes: *none*)
* [twitch-chat](https://nodecg.io/DEV/samples/twitch-chat/) (requires [oauth](https://twitchapps.com/tmi/))

## Custom Installation

This bundles provides NodeCG graphics that can be queried by using the `Graphics` tab of NodeCG.

**Font Awesome (Pro) required**: This bundle requires [Font Awesome](https://fontawesome.com/) for its NodeCG graphics. Add the Font Awesome's `css` and `webfonts` folders into the `graphics` folder of this bundle.