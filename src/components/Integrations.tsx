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
                    className="Button primary w-[92px]" 
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