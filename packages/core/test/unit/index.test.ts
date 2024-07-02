import { valueFromCore } from "../../src/";

describe("core", () => {
    it("should have the magic value", () => {
        expect(valueFromCore).toBe(42);
    });
});
