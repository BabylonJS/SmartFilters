/* eslint-disable @typescript-eslint/naming-convention */
import type { Config } from "@jest/types";

// Needs commonjs due to ts-jest issues with verbatim modules
const fs = require("fs");
const path = require("path");

//import { pathsToModuleNameMapper } from "ts-jest";

// const t = Object.assign(ts_preset, puppeteer_preset);

// const compilerOptions = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./tsconfig.json"), "utf8")).compilerOptions;

const createProject = (type: string) => {
    const setupFileLocation = path.resolve(".", `jest.${type}.setup.ts`);
    const setupFilesAfterEnvLocation = path.resolve(".", `jest.${type}.setup.afterEnv.ts`);
    const tsConfigPath = path.resolve(".", "tsconfig.json");
    const tsTestConfigPath = path.resolve(".", "tsconfig.test.json");
    const globalSetup = fs.existsSync(setupFileLocation) ? setupFileLocation : undefined;
    const setupFilesAfterEnv = fs.existsSync(setupFilesAfterEnvLocation) ? [setupFilesAfterEnvLocation] : undefined;
    const returnValue: Partial<Config.ProjectConfig> = {
        displayName: {
            name: type,
            color: "yellow",
        },
        testRegex: [`(/test/${type}/.*(test|spec))\\.[tj]sx?$`],
        // ----
        // moduleNameMapper: pathsToModuleNameMapper(
        //     {
        //         "@videofilters/core/dist/*": ["core/src/*"],
        //         "@videofilters/core": ["core/src"],
        //     },
        //     { prefix: "<rootDir>/packages/" }
        // ) as any,
        // ----
        roots: [path.resolve(".")],
        setupFilesAfterEnv: ["@alex_neo/jest-expect-message"],
        transform: {
            "^.+\\.(ts|tsx)$": [
                'ts-jest',
                {
                    useESM: true,
                    isolatedModules: true,
                    tsconfig: fs.existsSync(tsTestConfigPath) ? tsTestConfigPath : fs.existsSync(tsConfigPath) ? tsConfigPath : path.resolve(__dirname, "tsconfig.json"),
                    diagnostics: {
                        ignoreCodes: ['TS151001'],
                    },
                },
            ],
            "\\.[j]sx?$": "babel-jest",
        } as any,
        transformIgnorePatterns: ["<rootDir>/node_modules/(?!(@babylonjs)/).*/"],
    };
    if (globalSetup) {
        returnValue.globalSetup = globalSetup;
    }
    if (setupFilesAfterEnv) {
        returnValue.setupFilesAfterEnv?.push(...setupFilesAfterEnv);
    }
    if (type === "unit") {
        return {
            ...returnValue,
            preset: "ts-jest/presets/default-esm", // if puppeteer is needed: "./" + path.relative(__dirname, path.resolve(__dirname, "./scripts/tsPuppeteer.js")),
            testEnvironment: "node",
            extensionsToTreatAsEsm: [".ts"],
        };
    } else if (type === "visualization") {
        return {
            ...returnValue,
            preset: "./" + path.relative(__dirname, path.resolve(__dirname, "./scripts/tsPuppeteer.js")),
            extensionsToTreatAsEsm: [".ts"],
        };
    } else if (type === "integration" || type === "performance") {
        // not yet used
        return {
            ...returnValue,
            // preset: "./" + path.relative(__dirname, path.resolve(__dirname, "./scripts/tsPuppeteer.js")),
            globalSetup: "jest-environment-puppeteer/setup",
            globalTeardown: "jest-environment-puppeteer/teardown",
            testEnvironment: "jest-environment-puppeteer",
            preset: "jest-puppeteer",
            transform: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "^.+\\.ts$": "ts-jest",
            },
            extensionsToTreatAsEsm: [".ts"],
        };
    } else if (type === "interactions") {
        return {
            ...returnValue,
            preset: "ts-jest/presets/default-esm",
            testEnvironment: "node",
            extensionsToTreatAsEsm: [".ts"],
        };
    } else {
        return {};
    }
};

// Sync object
module.exports = {
    projects: [
        createProject("unit"),
        // createProject("visualization"),
        // createProject("integration"),
        // createProject("performance"),
        // createProject("interactions")
    ],
    // reporters: ["default", "jest-screenshot/reporter", "jest-junit"],
    reporters: ["default", "jest-junit"],
};
