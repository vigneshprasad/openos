import { type MutableRefObject, useState } from "react"
import React from "react";
import { api } from "~/utils/api";
import * as Select from '@radix-ui/react-select';
import { CheckCircledIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useSession } from "next-auth/react";

interface IProps {
  submitFormRef: MutableRefObject<HTMLFormElement | null>
}

export const UserForm: React.FC<IProps> = ({submitFormRef}: IProps) => {
  const {data: sessionData} = useSession()

  const [name, setName] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const userResource = api.user.update.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError(false);
      setLoading(false);
    },
    onError: () => {
        setSuccess(false);
        setError(true);
        setLoading(false);
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(false);

    void userResource.mutateAsync({
      name: name,
      role: role,
    })
  }

  return (
    <form className="grid gap-[28px]" ref={submitFormRef}>
      <label className="block">
        <span className="block text-sm font-medium text-[#C4C4C4]">Name</span>
        <input
          type="text"
          defaultValue={sessionData?.user.name ?? undefined}
          placeholder="What do we call you?"
          className="block w-full mt-1 px-3 py-2 bg-[#0B0B0B] rounded-md border border-solid 
          border-[#0B0B0B] focus:border-solid focus:border-[#373737] text-sm font-medium
          text-[#fff] placeholder:text-sm placeholder:text-[#838383] placeholder:font-medium"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block relative">
        <span className="block text-sm font-medium text-[#C4C4C4]">Role</span>
        <Select.Root onValueChange={(value) => setRole(value)}>
          <Select.Trigger
            className="w-full mt-1 px-3 py-2 inline-flex items-center justify-between bg-[#0B0B0B] 
            rounded-md border border-solid border-[#0B0B0B] focus:border-solid focus:border-[#373737] 
            text-sm font-medium text-[#fff] data-[placeholder]:text-[#838383]"
            aria-label="Role"
          >
            <Select.Value placeholder="Select what you do" />
            <Select.Icon className="text-[#fff]">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal className="absolute w-full top-10 left">
            <Select.Content 
              className="overflow-hidden bg-[#1A1A1A] rounded-md border border-solid border-[#373737]
                shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
              >
                <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-[#1A1A1A] 
                  text-[#fff] cursor-default">
                  <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="px-1 py-2">
                    {["Designer", "Developer", "Product Manager", 
                    "Graphic Designer", "Engineering Manager", 
                    "CEO"].map((role, i) => (
                      <SelectItem 
                        key={i} 
                        value={role.toLowerCase()}
                        className="px-2 py-1 text-[#fff] hover:bg-[#373737] rounded-md cursor-pointer">
                          {role}
                      </SelectItem>
                    ))}
                </Select.Viewport>
                <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-[#1A1A1A] 
                  text-[#fff] cursor-default">
                  <ChevronDownIcon />
                </Select.ScrollUpButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </label>
    </form>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, React.PropsWithChildren & Select.SelectItemProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <Select.Item
        {...props}
        ref={forwardedRef}
      >
        <div className="flex items-center justify-between">
          <Select.ItemText>{children}</Select.ItemText>
          <Select.ItemIndicator>
            <CheckCircledIcon />
          </Select.ItemIndicator>
        </div>
      </Select.Item>
    );
});

SelectItem.displayName = "SelectItem";

export default UserForm;