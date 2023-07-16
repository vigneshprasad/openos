import Image from "next/image";
import React, { useMemo, useState } from "react";
import { api } from "~/utils/api";

type CommandHistory = {
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    input: string,
    feedback: number,
    type: string
}


export const PreviousModelsSection: React.FC = () => {

    const [modelHistory, setModelHistory] = useState<CommandHistory[]>([]);

    // const commandHistoryMutation = api.commandHistory.getAll.useMutation({
    //     onSuccess: (data) => {
    //         setCommandHistory(data)
    //     },
    //     onError: () => {
    //         return null;
    //     }
    // })

    // useMemo(() => commandHistoryMutation.mutate(), [])

    return (
        <div className="bg-slate-100">
            <div className="h-12 p-3 border-b border-solid border-b-slate-200">
                <text className="text-sm text-[#838383] font-medium">Previous Models</text>
            </div>
            <div className="overflow-auto">
                {modelHistory && modelHistory?.length === 0 ? (
                    <div className="w-[80%] mx-auto mt-[70px]">
                        <Image 
                            src="/command_history_empty.png" 
                            alt="Command History" 
                            width={36} 
                            height={36} 
                            className="mx-auto" />
                        <div className="pt-3">
                        <h3 className="text-sm font-medium text-center">
                            Your command history is empty
                        </h3>
                        <p className="pt-1 text-xs text-[#838383] text-center">
                            All the commands you write will be shown in the history. 
                            {/* You can repeat commands or command sets by clicking on them here. */}
                        </p>
                        </div>
                    </div>) : (
                    <div className="flex flex-col gap-2">
                        {modelHistory?.map((command, index) => (
                            <div 
                                className="pl-3 pr-5 flex gap-4 items-center cursor-pointer hover:bg-slate-100 text-[#616161]"
                                key={index}
                            >
                                <p className="min-w-[15px] text-xs">{index + 1}</p>
                                <div className="px-2 py-1 truncate">
                                    <p className="text-xs">{command.input}</p>
                                </div>
                            </div>
                        ))}
                    </div>)
                }
            </div>
        </div>
    )
}