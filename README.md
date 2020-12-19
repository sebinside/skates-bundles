# skates-bundles

skate702's custom nodecg-io bundles live from the stream at [skate702.tv](https://skate702.tv)!

## Very basic installation guide

1. Make sure that you have [nodecg](https://nodecg.dev) and [nodecg-io](https://nodecg.io) already installed.

2. Clone this repo into the nodecg-io installation directory
    ```shell
    nodecg/nodecg-io $ git clone https://github.com/sebinside/skates-bundles.git
    ```

3. Add skates-bundles to the lerna configuration

    Open the `lerna.json` and add `skates-bundles/*` to the `packages` array.

    Your `lerna.json` with the added entry might look like this (don't copy this, make the change yourself! The `lerna.json` might change in the nodecg-io repo.):

    ```json
    {
        "packages": ["nodecg-io-*", "nodecg-io-core/dashboard", "samples/*", "skates-bundles/*"],
        "version": "0.1.0"
    }
    ```

4. Add skates-bundles to the nodecg configuration

    Add the absolute path to the skates-bundles directory to the nodecg configuration file that is located at `path/to/nodecg/cfg/nodecg.json`.

    Your `nodecg.json` might look like this with nodecg-io, the nodecg-io samples and skates-bundles installed:

    ```json
    {
        "bundles": {
            "paths": ["path/to/nodecg/nodecg-io/", "path/to/nodecg/nodecg-io/samples/", "path/to/nodecg/nodecg-io/skates-bundles/"]
        }
    }
    ```

5. Bootstrap and compile

    Install all dependencies of all bundles in this repository, link all nodecg-io components and compile TypeScript using these commands:

    ```shell
    nodecg/nodecg-io $ npm run bootstrap
    nodecg/nodecg-io $ npm run build
    ```

    Note that this is run in the nodecg-io directory and not in the skates-bundles directory.

    If the TypeScript didn't get compiled and you didn't get an error make sure that skates-samples was recognized by lerna by showing all recognized packages by running the following:

    ```shell
    nodecg/nodecg-io $ npx lerna ls
    ```

    It should display all nodecg-io related bundles and all bundles that are in the skates-samples repository. If not make sure that you got your `lerna.json` file from step 3 right.

6. Start nodecg
