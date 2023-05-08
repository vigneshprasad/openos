import { type NextPage } from "next";
import { BaseLayout } from "~/components/BaseLayout";
import { SavedTemplates } from "~/components/SavedTemplates";

const CustomizationPage: NextPage = () => {
  return (
    <BaseLayout activeKey="customization">
        <div className="pl-5 pr-4 pt-6 bg-[#131313] grid grid-cols-1 grid-rows-[max-content_1fr]">
            <div className="pb-5 border-b border-solid border-[#333]">
                <h1 className="text-xl text-[#fff]">
                    Customization
                </h1>
                <p className="pt-1 text-sm font-medium text-[#838383]">
                    Use saved templates to generate reports in minutes.
                </p>
            </div>
            <div className="hide-scrollbar mx-[20%] pt-5 flex flex-col gap-4 overflow-y-auto">
                <SavedTemplates />
            </div>
        </div>
    </BaseLayout>
  )
}

export default CustomizationPage;