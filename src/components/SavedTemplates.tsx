import { InfoCircledIcon } from "@radix-ui/react-icons"

export const SavedTemplates: React.FC = () => {
    return (
        <div>
            <div className="pb-[18px] flex gap-1 items-center">
                <InfoCircledIcon color="#838383" width={20} height={20} />
                <p className="text-sm font-normal text-[#838383]">
                    Using a template will execute associated commands in your terminal
                </p>
            </div>

            <div className="pb-6 flex flex-col gap-4">
                {Array(4).fill("").map((item, index) => (
                    <div className="h-max" key={index}>
                        <div className="min-h-[108px] pt-3 pb-4 px-4 bg-[#1C1C1C] rounded-md grid grid-cols-[1fr_max-content] 
                            gap-3 items-start">
                            <div>
                                <h1 className="text-sm font-semibold text-[#fff]">
                                    Cash Burn
                                </h1>
                                <p className="pt-1 pb-3 text-sm font-medium text-[#616161]">
                                    See how much you spend every month and see where your cash goes
                                </p>
                                <div className="flex gap-2">
                                    <div className="py-0.5 px-2 bg-[#2B2B2B] rounded-[4px] text-xs 
                                        font-medium text-[#C4C4C4]">
                                        Report
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-5 items-center">
                                <p className="text-sm font-normal text-[#5EA3FB] cursor-pointer hover:underline">
                                    Preview
                                </p>
                                <button className="py-[7.5px] px-3 bg-[#333134] rounded-md max-h-9 text-sm font-normal 
                                    text-[#fff] cursor-pointer hover:bg-[#373737]">
                                    Use Template
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}