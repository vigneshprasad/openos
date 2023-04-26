import Image from "next/image";
import { DatabaseResourceForm } from "./DatabaseResourceForm";
import { RazorpayResourceForm } from "./RazorpayResourceForm";
import { StatementUploadForm } from "./StatementUploadForm";

interface IProps {
  onSuccessCallback?: () => void
}

export const Integrations: React.FC<IProps> = ({onSuccessCallback}) => {
  return (
    <>
      <div className="pb-6 flex flex-col gap-4 max-h-60 overflow-y-auto">
        <div className="py-3 pl-3 pr-4 grid grid-rows-1 grid-cols-[max-content_1fr_max-content] gap-4 items-start bg-[#1C1C1C] rounded-md">
          <Image src="/postgresql.png" alt="PostgreSQL" width={32} height={32} className="mt-1 rounded" />
          <div>
            <h3 className="text-sm text-[#fff] font-semibold">PostgreSQL</h3>
            <p className="pt-1 pb-2 text-sm text-[#616161] font-medium">
                Connect your database to create reports & retrieve data.
            </p>
            <a 
              href="https://www.postgresql.org/" 
              target="_blank" 
              className="text-[#5EA3FB] text-sm font-normal hover:underline hover:underline-offset-2"
            >
              About this app
            </a>
          </div>
          <DatabaseResourceForm />
        </div>

        <div className="py-3 pl-3 pr-4 grid grid-rows-1 grid-cols-[max-content_1fr_max-content] gap-4 items-start bg-[#1C1C1C] rounded-md">
          <Image src="/razorpay.png" alt="PostgreSQL" width={32} height={32} className="mt-1 rounded" />
          <div>
            <h3 className="text-sm text-[#fff] font-semibold">Razorpay</h3>
            <p className="pt-1 pb-2 text-sm text-[#616161] font-medium">
                Use Razorpay to pull your financial data & create financial reports
            </p>
            <a 
              href="https://razorpay.com/" 
              target="_blank" 
              className="text-[#5EA3FB] text-sm font-normal hover:underline hover:underline-offset-2"
            >
              About this app
            </a>
          </div>
          <RazorpayResourceForm />
        </div>

        <div className="py-3 pl-3 pr-4 grid grid-rows-1 grid-cols-[max-content_1fr_max-content] gap-4 items-start bg-[#1C1C1C] rounded-md">
          <Image src="/bank.png" alt="Bank Statement" width={32} height={32} className="mt-1 rounded" />
          <div>
            <h3 className="text-sm text-[#fff] font-semibold">Bank Statement</h3>
            <p className="pt-1 pb-2 text-sm text-[#616161] font-medium">
              A list of all transactions for a bank account over a set period, usually monthly
            </p>
          </div>
          <StatementUploadForm />
        </div>
      </div>
      <div className="flex justify-center">
        <button 
          className="Button primary w-[92px]" 
          onClick={() => onSuccessCallback && onSuccessCallback()}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default Integrations;