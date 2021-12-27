# skate's Bundles

This repository contains [NodeCG](https://nodecg.dev) bundles, that are used in [twitch livestream](https://skate702.tv).
This includes live chat interacation and remote control capabilities, e.g., triggering smart lights by channel points.
All bundles heavily rely on the [nodecg-io](https://nodecg.io) project.

## Bundle Overview

**TODO**


## Installation

1. Make sure that you have [NodeCG](https://nodecg.dev) and [nodecg-io](https://nodecg.io) **development version 0.3** already installed.

2. Clone this repo into the nodecg-io installation directory

    ```shell
    nodecg/nodecg-io $ git clone https://github.com/sebinside/skates-bundles.git
    ```

3. Add skates-bundles to the workspace configuration

    Open the `package.json` and add `skates-bundles/*` to the `workspaces` array.

    Your `package.json` with the added entry might look like this (don't copy this, make the change yourself! The `package.json` might change in the nodecg-io repo.):

    **File:** `nodecg/nodecg-io/package.json`

    ```diff { .language-json}
    ...
    ~    "workspaces": [
    ~        "nodecg-io-core",
    ~        "nodecg-io-core/dashboard",
    ~        "services/*",
    ~        "samples/*",
    -        "utils/*"
    +        "utils/*",
    +        "skates-bundles/*"
    ~    ]
    ~ }
    ```

4. Add skates-bundles to the NodeCG configuration

    Add the absolute path to the skates-bundles directory to the NodeCG configuration file that is located at `path/to/nodecg/cfg/nodecg.json`.

    Your `nodecg.json` might look like this with nodecg-io, the nodecg-io samples and skates-bundles installed:

    **File:** `/nodecg/cfg/nodecg.json`

    ```diff
    ~ {
    ~     "bundles": {
    ~         "paths": [
    ~             "/absolute/path/to/nodecg/nodecg-io",
    ~             "/absolute/path/to/nodecg/nodecg-io/services",
    -             "/absolute/path/to/nodecg/nodecg-io/samples"
    +             "/absolute/path/to/nodecg/nodecg-io/samples",
    +             "/absolute/path/to/nodecg/nodecg-io/skates-bundles"
    ~         ]
    ~     }
    ~ }
    ```

5. Add skates-bundles to build script and tsconfig.json

    The build script in `nodecg-io/.scripts/update-paths.mjs` updates all the typescript paths, so the typescript compiler knows where to look for bundles.

    **File:** `nodecg/nodecg-io/.scripts/update-paths.mjs`

    ```diff
    ~ import * as fs from "fs";
    ~
    - const DIRS = ["./samples", "./services", "./utils"];
    + const DIRS = ["./samples", "./services", "./utils", "./skates-bundles"];
    ~
    ...
    ```

    Also, you will have to add skates-bundles to nodecg-io's tsconfig.json:

    **File:** `nodecg/nodecg-io/tsconfig.json`

    ```diff
    ~
    ~         {
    ~             "path": "./samples"
    ~         },
    ~         {
    ~             "path": "./utils"
    -         }
    +         },
    +         {
    +             "path": "./skates-bundles"
    +         }
    ~     ]
    ~ }
    ```

6. Install and compile

    Install all dependencies of all bundles in this repository, link all nodecg-io components and compile TypeScript using these commands:

    ```shell
    nodecg/nodecg-io $ npm install
    nodecg/nodecg-io $ npm run build
    ```

    Note that this is run in the nodecg-io directory and not in the skates-bundles directory.

7. Start NodeCG

    It should display all nodecg-io related bundles and all bundles that are in the skates-samples repository. If not, make sure that you got your configuration files from step 3 through 5 right.
    
## Bundle-specific Requirements and Usage

**TODO**
