/**
 * Represents the owner of a command.
 * In practice, it will mostly be a block, the smart filter or a tool injectings commands.
 */
export interface ICommandOwner {
    /**
     * The friendly name of the owner.
     */
    readonly name: string;

    /**
     * Gets the class name of the owner.
     */
    getClassName(): string;
}

/**
 * Represents a the action of a @see Command. This is what will be exectuted during a command buffer execution.
 */
export type CommandAction = () => void;

/**
 * Represents a command to execute.
 *
 * A command contains a function that will be executed at runtime by the smart filter.
 *
 * It also contains the owner of the command for debugging purposes.
 */
export type Command = {
    /**
     * The friendly name of the command.
     */
    readonly name: string;

    /**
     * The owner of the command.
     * In practice, it will mostly be a block, the smart filter or a tool injectings commands.
     */
    readonly owner: ICommandOwner;

    /**
     * Defines the action to exectute.
     */
    readonly action: CommandAction;
};

/**
 * Creates a new command.
 * @param name - The friendly name of the command
 * @param owner - The owner of the command
 * @param action - The action to execute when the command is executed
 * @returns The new command
 */
export function createCommand(
    name: string,
    owner: ICommandOwner,
    action: CommandAction
): Command {
    return {
        name,
        owner,
        action,
    };
}