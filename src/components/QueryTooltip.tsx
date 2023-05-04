import { InfoCircledIcon } from "@radix-ui/react-icons";
import * as Tooltip from '@radix-ui/react-tooltip';

interface IProps {
    query: string;
}

export const QueryTooltip: React.FC<IProps> = ({query}) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
            <InfoCircledIcon />
        </Tooltip.Trigger>

        <Tooltip.Portal>
            <Tooltip.Content
                className="bg-[#161517] px-3 py-2 text-xs text-[#fff] leading-relaxed
                rounded-md border border-solid border-[#1D1D1D] 
                shadow-[0px_4px_12px_rgba(0,0,0,0.36)] w-[500px]"
                side="right"
                sideOffset={5}
            >
                {query}
            </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
  </Tooltip.Provider>
  )
}