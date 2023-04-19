import { type Prisma, type CommandHistory } from "@prisma/client";
import { prisma } from "~/server/db";
import { type CommandResultType } from "~/types/types";

export const returnCommandResult = async (
    type: string,
    input: string, 
    data: CommandResultType,
    userId: string,
):Promise<CommandHistory> => {

    const output = JSON.parse(JSON.stringify(data)) as Prisma.JsonObject;
    console.log(output);
    
    const commandResult = await prisma.commandHistory.create({
        data: {
            userId: userId,
            input: input,
            output: output,
            type: type,
        }
    });

    return commandResult;
}