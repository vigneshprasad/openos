import { type DataModel } from "@prisma/client";
import Image from "next/image";
import React from "react";

interface IProps {
    models: DataModel[]
}

export const PreviousModelsSection: React.FC<IProps> = ({ models }) => {
    return (
        <div className="bg-slate-100 grid grid-rows-[max-content_1fr] grid-cols-1">
            <div className="h-12 p-3 border-b border-solid border-b-slate-200">
                <text className="text-sm text-[#838383] font-medium">Previous Models</text>
            </div>
            <div className="overflow-auto">
                {models && models?.length === 0 ? (
                    <div className="w-[80%] mx-auto mt-[70px]">
                        <Image
                            src="/command_history_empty.png"
                            alt="Model Creation History"
                            width={36}
                            height={36}
                            className="mx-auto" />
                        <div className="pt-3">
                            <h3 className="text-sm font-medium text-center">
                                Your model creation history is empty
                            </h3>
                            <p className="pt-1 text-xs text-[#838383] text-center">
                                All the models you created will be shown in the history.
                            </p>
                        </div>
                    </div>) : (
                    <div className="flex flex-col gap-2">
                        {models?.map((model, index) => (
                            <div
                                className="pl-3 pr-5 flex gap-4 items-center hover:bg-slate-100 text-[#616161]"
                                key={index}
                            >
                                <div className="px-2 py-1 break-normal">
                                    <p className="text-xs">{model.name} : {model.description}</p>
                                </div>
                                {   
                                    model.completionStatus ? <div className="rounded bg-[#57E777] px-4 pb-2 pt-2 width-15" />
                                    : <div className="rounded bg-[#E4E757] px-4 pb-2 pt-2 width-15" />
                                }   
                            </div>
                        ))}
                    </div>)
                }
            </div>
        </div>
    )
}