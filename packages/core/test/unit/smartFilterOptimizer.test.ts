import {
    ConnectionPointType,
    CustomShaderBlock,
    importCustomBlockDefinition,
    InputBlock,
    type ShaderBlock,
    SmartFilter,
    SmartFilterOptimizer,
} from "../../dist/index.js";

describe("smartFilterOptimizer", () => {
    describe("when a block has multiple overloads of a helper function", () => {
        it("should emit all of them in the optimized shader block", () => {
            // Arrange
            const smartFilter = new SmartFilter("Test");

            const testBlockWithOverloadsDefinition = importCustomBlockDefinition(testBlockWithOverloadsAnnotatedGlsl);
            if (testBlockWithOverloadsDefinition.format !== "shaderBlockDefinition") {
                throw new Error("Block definition format is not shaderBlockDefinition");
            }
            const testBlockWithOverloads = CustomShaderBlock.Create(
                smartFilter,
                "TestBlock1",
                testBlockWithOverloadsDefinition
            );
            const textureInputBlock = new InputBlock(smartFilter, "texture", ConnectionPointType.Texture, null);
            const mixInputBlock = new InputBlock(smartFilter, "amount", ConnectionPointType.Float, 0.5);

            textureInputBlock.output.connectTo(testBlockWithOverloads.findInput("input")!);
            mixInputBlock.output.connectTo(testBlockWithOverloads.findInput("amount")!);
            testBlockWithOverloads.output.connectTo(smartFilter.output);

            const optimizer = new SmartFilterOptimizer(smartFilter, {
                maxSamplersInFragmentShader: 16,
                removeDisabledBlocks: false,
            });

            // Act
            const optimizedSmartFilter = optimizer.optimize();

            // Assert
            expect(optimizedSmartFilter).not.toBeNull();
            const optimizedBlock = optimizedSmartFilter!.attachedBlocks.find((b) => b.name === "optimized");
            const optimizedShaderProgram = (optimizedBlock as ShaderBlock).getShaderProgram();
            const fragmentShaderCode = optimizedShaderProgram.fragment.functions[0]?.code;
            expect(fragmentShaderCode?.indexOf("vec4 _getColor_(float f)")).toBeGreaterThan(-1);
            expect(fragmentShaderCode?.indexOf("vec4 _getColor_(vec3 v)")).toBeGreaterThan(-1);
        });
    });

    describe("when a smart filter has multiple instances of a block which has multiple overloads of a helper function", () => {
        it("should emit all of them in the optimized shader block exactly once", () => {
            // Arrange
            const smartFilter = new SmartFilter("Test");
            const testBlockWithOverloadsDefinition = importCustomBlockDefinition(testBlockWithOverloadsAnnotatedGlsl);
            if (testBlockWithOverloadsDefinition.format !== "shaderBlockDefinition") {
                throw new Error("Block definition format is not shaderBlockDefinition");
            }
            const testBlockWithOverloads1 = CustomShaderBlock.Create(
                smartFilter,
                "TestBlock1",
                testBlockWithOverloadsDefinition
            );
            const testBlockWithOverloads2 = CustomShaderBlock.Create(
                smartFilter,
                "TestBlock2",
                testBlockWithOverloadsDefinition
            );
            const textureInputBlock = new InputBlock(smartFilter, "texture", ConnectionPointType.Texture, null);
            const mixInputBlock = new InputBlock(smartFilter, "amount", ConnectionPointType.Float, 0.5);

            textureInputBlock.output.connectTo(testBlockWithOverloads1.findInput("input")!);
            mixInputBlock.output.connectTo(testBlockWithOverloads1.findInput("amount")!);
            mixInputBlock.output.connectTo(testBlockWithOverloads2.findInput("amount")!);
            testBlockWithOverloads1.output.connectTo(testBlockWithOverloads2.findInput("input")!);
            testBlockWithOverloads2.output.connectTo(smartFilter.output);

            const optimizer = new SmartFilterOptimizer(smartFilter, {
                maxSamplersInFragmentShader: 16,
                removeDisabledBlocks: false,
            });

            // Act
            const optimizedSmartFilter = optimizer.optimize();

            // Assert
            expect(optimizedSmartFilter).not.toBeNull();
            const optimizedBlock = optimizedSmartFilter!.attachedBlocks.find((b) => b.name === "optimized");
            const optimizedShaderProgram = (optimizedBlock as ShaderBlock).getShaderProgram();
            const fragmentShaderCode = optimizedShaderProgram.fragment.functions[0]?.code;
            expect((fragmentShaderCode!.match(/vec4 _getColor_\(float f\)/g) || []).length).toBe(1);
            expect((fragmentShaderCode!.match(/vec4 _getColor_\(vec3 v\)/g) || []).length).toBe(1);
        });
    });
});

const testBlockWithOverloadsAnnotatedGlsl = `
/*  
{ 
    "smartFilterBlockType": "TestBlockWithOverloads", 
    "namespace": "Babylon.UnitTests", 
    "blockDisableStrategy": "AutoSample"
}
*/

uniform sampler2D input; // main
uniform float amount;

vec4 greenScreen(vec2 vUV) { // main
    vec4 color = texture2D(input, vUV);
    vec4 otherColor = mix(getColor(0.0), getColor(vec3(0.0, 1.0, 0.0)), amount);

    return mix(color, otherColor, amount);
}

vec4 getColor(float f) {
    return vec4(f);
}

vec4 getColor(vec3 v) {
    return vec4(v, 1.0);
}
`;
