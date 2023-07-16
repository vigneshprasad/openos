import { type NextPage } from "next";
import { BaseLayout } from "~/components/BaseLayout";
import { IntegrationsList } from "~/components/IntegrationsList";

const IntegrationsPage: NextPage = () => {
  return (
    <BaseLayout activeKey="integrations">
        <div className="pl-5 pr-4 pt-6 bg-homepage-tab-background grid grid-cols-1">
            <div className="pb-5 border-b border-solid border-[#333]">
                <h1 className="text-xl">
                    Integrations and connected apps
                </h1>
                <p className="pt-1 text-sm font-medium text-[#969696]">
                    Supercharge your productivity and connect the tools you use everyday.
                </p>
            </div>
            <div className="hide-scrollbar mx-[20%] pt-5 flex flex-col gap-4 overflow-y-auto">
                <IntegrationsList />
            </div>
        </div>
    </BaseLayout>
  )
}

export default IntegrationsPage;