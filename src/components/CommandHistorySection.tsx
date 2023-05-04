import Image from "next/image";
import React from "react";

type CommandHistory = {
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    input: string,
    feedback: number,
    type: string
}

interface IProps {
  commands?: CommandHistory[];
  selectCommandFromHistory: (command: string) => void;
}

export const CommandHistorySection: React.FC<IProps> = ({commands, selectCommandFromHistory}) => {
    return (
        <div className="grid grid-rows-[max-content_1fr] grid-cols-1 bg-[#1C1B1D] border border-solid 
            border-[#333333] border-l-0">
            <div className="p-3 border-b border-solid border-b-[#333333]">
                <text className="text-sm text-[#838383] font-medium">Command History</text>
            </div>
            <div className="overflow-auto">
                {commands && commands?.length === 0 ? (
                    <div className="w-[80%] mx-auto mt-[70px]">
                        <Image 
                            src="/command_history_empty.png" 
                            alt="Command History" 
                            width={36} 
                            height={36} 
                            className="mx-auto" />
                        <div className="pt-3">
                        <h3 className="text-[#fff] text-sm font-medium text-center">
                            Your command history is empty
                        </h3>
                        <p className="pt-1 text-xs text-[#838383] text-center">
                            All the commands you write will be shown in the history. 
                            {/* You can repeat commands or command sets by clicking on them here. */}
                        </p>
                        </div>
                    </div>) : (
                    <div className="py-5 flex flex-col gap-2">
                        {commands?.map((command, index) => (
                            <div 
                                className="pl-3 pr-5 flex gap-4 items-center cursor-pointer hover:bg-[#373737]"
                                key={index}
                                onClick={() => selectCommandFromHistory(command.input)}
                            >
                                <p className="min-w-[15px] text-xs text-[#616161]">{index + 1}</p>
                                <div className="px-2 py-1 truncate">
                                    <p className="text-xs text-[#C4C4C4]">{command.input}</p>
                                </div>
                            </div>
                        ))}
                    </div>)
                }
            </div>
        </div>
    )
}