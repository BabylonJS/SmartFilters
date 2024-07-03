import { determineVersion } from "../../tools/determineVersion.js";

describe("versionUp", () => {
    describe("when NPM has no version yet", () => {
        let npmVersion = null;

        it("should use the package.json version", () => {
            const packageJsonVersion = "1.0.0";
            expect(determineVersion(npmVersion, packageJsonVersion)).toBe(packageJsonVersion);
        });
    });

    describe("when NPM has a version", () => {
        let npmVersion = "2.3.4";

        describe("when package.json has the same major and minor version", () => {
            it("should use the npm version and increment the patch version", () => {
                const packageJsonVersion = "2.3.0";
                expect(determineVersion(npmVersion, packageJsonVersion)).toBe("2.3.5");
            });
        });

        describe("when package.json has the same major and a different minor version", () => {
            it("should use the npm version and increment the patch version", () => {
                const packageJsonVersion = "2.4.1";
                expect(determineVersion(npmVersion, packageJsonVersion)).toBe("2.4.1");
            });
        });

        describe("when package.json has a different major and minor version", () => {
            it("should use the npm version and increment the patch version", () => {
                const packageJsonVersion = "9.9.6";
                expect(determineVersion(npmVersion, packageJsonVersion)).toBe("9.9.6");
            });
        });
    });
});
