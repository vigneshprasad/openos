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
          'text-xs text-dark-text flex items-center pl-8 pr-4 py-2 relative select-none data-[highlighted]:outline-none',
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
    disabled?: boolean;
}

const Select: React.FC<IProps> = ({
    title,
    options,
    value,
    defaultValue,
    onChange,
    disabled
}) => (
    <RadixSelect.Root defaultValue={defaultValue?.toString()} value={value?.toString()} onValueChange={onChange} disabled={disabled}>
        <RadixSelect.Trigger
            className=" text-xs text-dark-text-colour rounded-lg inline-flex justify-center px-4 py-2 bg-white border border-border-colour drop-shadow-md"
        >
            <RadixSelect.Value placeholder={title}/>
            <RadixSelect.Icon className="text-dark-text-colour">
                <ChevronDownIcon />
            </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
            <RadixSelect.Content className="overflow-hidden bg-white rounded-lg drop-shadow-md">
                <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 bg-white cursor-default">
                    <ChevronUpIcon />
                </RadixSelect.ScrollUpButton>
                <RadixSelect.Viewport className="p-1">
                    <RadixSelect.Group>
                        {
                            options.map((option) => (
                                <SelectItem key={option.value.toString()} value={option.value}>{option.label}</SelectItem>
                            ))
                        }
                    </RadixSelect.Group>
                </RadixSelect.Viewport>
                <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-dark-text-colour cursor-default">
                    <ChevronDownIcon />
                </RadixSelect.ScrollDownButton>
            </RadixSelect.Content>
        </RadixSelect.Portal>
    </RadixSelect.Root>
);

export default Select;