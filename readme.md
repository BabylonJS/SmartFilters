# Babylon.js Smart Filters

Smart Filters is a graph based system for applying GPU accelerated effects to videos or still images with a built-in optimizer.

See the full documentation at [doc.babylonjs.com](https://doc.babylonjs.com/features/featuresDeepDive/smartFilters/)

## Structure

These are the packages in this monorepo:

### core

This is the main package for Smart Filters. It implements the notion of a `SmartFilter` which is a graph of blocks (all inheriting from `BaseBlock`) linked to each other through `ConnectionPoint`s.

More info can be found in the dedicated [readme](./packages/core/readme.md).

### demo

Entry point of the demo application integrating Smart Filters. This demo is also used as the dev inner loop for working on the Core.

More info can be found in the dedicated [readme](./packages/demo/readme.md).

### editor

This package contains the graphical editor control used by the demo and the Smart Filter Editor.

More info can be found in the dedicated [readme](./packages/editor/readme.md).

### sfe

This package contains the visual editor application deployed to https://sfe.babylonjs.com.

More info can be found in the dedicated [readme](./packages/sfe/readme.md).

## Running Locally

After cloning the repo, running locally during development is as simple as:

```
npm install
npm start
```

The local Smart Filter demo will run at http://localhost:8080

If you want to run the Smart Filter Editor application locally, start with:

```
npm install
npm run start:sfe
```

The local build of the Smart Filter Editor will run at http://localhost:8081

In both cases, the code is watched for changes and will automatically incrementally build and reload the webpage.

For VSCode users, if you have installed the Chrome Debugging extension, you can start debugging within VSCode by using the appropriate launch menu.

## Additional Build Commands

The monorepo is based on npm workspace and typescript composite projects. All the packages are trying to be of type "module" without side effects for simple consumption. You can find additional commands of the repo below.

The following command will run all the test projects in the repo:

```
npm run test
```

A full production build is similar:

```
npm run build
```

Linting and formatting can be tested with:

```
npm run lint:check
```
