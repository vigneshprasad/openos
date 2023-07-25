import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import {twMerge} from 'tailwind-merge';
import { type SelectOption } from '~/types/types';

interface ISelectItemProps {
    className?: string;
    children: React.ReactNode;
    value?: string | Date | number;
}

const SelectItem: React.FC<ISelectItemProps> = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
    return (
        <RadixSelect.Item className={twMerge(
          'text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1',
          className)} 
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ref={forwardedRef} {...props}
        >
            <RadixSelect.ItemText>
                {children}
            </RadixSelect.ItemText>
            <RadixSelect.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                <CheckIcon />
            </RadixSelect.ItemIndicator>
        </RadixSelect.Item>
    );
});

SelectItem.displayName = 'SelectItem';

interface IProps {
    title: string;
    options: SelectOption[];
    value?: string | Date;
    defaultValue?: string | Date;
    onChange?: (value: string) => void;
}

const Select: React.FC<IProps> = ({
    title,
    options,
    value,
    defaultValue,
    onChange
}) => (
    <RadixSelect.Root defaultValue={defaultValue?.toString()} value={value?.toString()} onValueChange={onChange}>
        <RadixSelect.Trigger
            className="inline-flex items-center justify-center px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-violet11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] data-[placeholder]:text-primary border border-primary rounded-lg outline-none"
        >
            <RadixSelect.Value placeholder={title}/>
            <RadixSelect.Icon className="text-violet11">
                <ChevronDownIcon />
            </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
            <RadixSelect.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                <RadixSelect.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white cursor-default">
                    <ChevronUpIcon />
                </RadixSelect.ScrollUpButton>
                <RadixSelect.Viewport className="p-[5px]">
                    <RadixSelect.Group>
                        {
                            options.map((option) => (
                                <SelectItem key={option.value.toString()} value={option.value}>{option.label}</SelectItem>
                            ))
                        }
                    </RadixSelect.Group>
                </RadixSelect.Viewport>
                <RadixSelect.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                    <ChevronDownIcon />
                </RadixSelect.ScrollDownButton>
            </RadixSelect.Content>
        </RadixSelect.Portal>
    </RadixSelect.Root>
);

export default Select;