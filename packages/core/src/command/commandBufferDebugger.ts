import type { CommandBuffer } from "./commandBuffer";

/**
 * Logs all the commands associated to a command buffer.
 * @param commandBuffer - The command buffer to log
 */
export function logCommands(commandBuffer: Readonly<CommandBuffer>) {
    console.log("----- Command buffer commands -----");
    commandBuffer.visitCommands((command) => {
        console.log(`  Owner: ${command.owner.blockType} (${command.owner.name}) - Command: ${command.name}`);
    });
    console.log("-----------------------------------");
}
