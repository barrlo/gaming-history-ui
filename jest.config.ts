/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

const config: Config = {
    clearMocks: true,
    collectCoverage: false,
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: ["src/**/*.(js|jsx|ts|tsx)"],
    coverageDirectory: "coverage",
    // An array of regexp pattern strings used to skip coverage collection
    // coveragePathIgnorePatterns: [
    //   "/node_modules/"
    // ],
    // Indicates which provider should be used to instrument code for coverage
    // coverageProvider: "babel",
    coverageReporters: [
        "lcov"
    ],
    // An object that configures minimum threshold enforcement for coverage results
    // coverageThreshold: undefined,
    resetModules: true,
    restoreMocks: true,
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testEnvironment: "jsdom",
    verbose: true
};

export default createJestConfig(config);
