# skate's Bundles: nanoleaf-events

This bundle triggers Nanoleaf Shapes based on live events like channel points, subs, and hype trains.


## Features
* Randomly colors random shapes when triggered by channel points (only if no other event is queued)
* Randomly colors all shapes when triggered by channel points (only if no other event is queued)
* Flow effect when triggered by a new subscriber in the colors of the sub icon
* Multi-color flow effect when triggered by a new subscriber with a sub milestone
* Rainbow flow effect triggered by hype trains, effect speed depends on the level of the train
* Internal queue holding subscriber-related flow effects, processed after hype trains


## Service Dependencies

* [nanoleaf](https://nodecg.io/DEV/samples/nanoleaf/)
* [twitch-api](https://nodecg.io/DEV/samples/twitch-api/) (requires [oauth](https://twitchapps.com/tokengen/), scopes: `channel:read:hype_train`)
* [twitch-pubsub](https://nodecg.io/DEV/samples/twitch-pubsub/) (requires [oauth](https://twitchapps.com/tokengen/), scopes: `channel:read:redemptions channel:read:subscriptions channel_subscriptions`)


## Custom Installation

*none*