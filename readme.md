# Babylon.js Smart Filters

Smart Filters is a graph based system for applying GPU accelerated effects to videos or still images with a built-in optimizer.

## Structure

These are the packages in this monorepo:

### core

This is the main package for Smart Filters. It implements the notion of a `SmartFilter` which is a graph of blocks (all inheriting from `BaseBlock`) linked to each other through `ConnectionPoint`s. This package also contains a library of useful blocks.

More info can be found in the dedicated [readme](./packages/core/readme.md).

### demo

Entry point of the demo application for creating and running filters. This demo is also used as the dev inner loop for working on the Core.

More info can be found in the dedicated [readme](./packages/demo/readme.md).

### editor

A simple visual editor for Smart Filters (still in POC state).

More info can be found in the dedicated [readme](./packages/editor/readme.md).

## Running locally

After cloning the repo, running locally during development is as simple as:

```
npm install
npm start
```

For VSCode users, if you have installed the Chrome Debugging extension, you can start debugging within VSCode by using the appropriate launch menu.

## Build Tricks

The monorepo is based on npm workspace and typescript composite projects. All the packages are trying to be of type "module" without side effects for simple consumption. You can find below the main commands of the repo.

The following command will run all the test projects in the repo:

```
npm run test
```

Building is pretty similar to testing:

```
npm run build
```

Linting and formatting can be tested with:

```
npm run lint:check
```
