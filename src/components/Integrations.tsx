import { IntegrationsList } from "./IntegrationsList";

interface IProps {
  onSuccessCallback?: () => void
  skipOption?: (value: boolean) => void
}

export const Integrations: React.FC<IProps> = ({onSuccessCallback, skipOption}) => {
  return (
    <>
      <div className="pb-6 flex flex-col gap-4 max-h-60 overflow-y-auto">
        <IntegrationsList />
      </div>
      <div className="flex justify-center">
        <button 
          className="Button primary w-[92px]" 
          onClick={() => {
            console.log("Is this happening?");
            skipOption && skipOption(true)
            onSuccessCallback && onSuccessCallback()
          }}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default Integrations;