import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { IntegrationsList } from "./IntegrationsList";
import { AnalyticsEvents } from "~/utils/analytics/types";

interface IProps {
  onSuccessCallback?: () => void
  skipOption?: (value: boolean) => void
}

export const Integrations: React.FC<IProps> = ({onSuccessCallback, skipOption}) => {

    const { track } = useAnalytics();

    return (
        <>
            <div className="pb-6 flex flex-col gap-4 max-h-60 overflow-y-auto">
                <IntegrationsList />
            </div>
            <div className="flex justify-center">
                <button 
                    className="bg-primary/10 text-primary rounded-md mt-3 py-2 px-3 font-normal text-md flex gap-1.5 hover:bg-primary/20 cursor-pointer" 
                    onClick={() => {
                    track(AnalyticsEvents.integrations_next_button_clicked)
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