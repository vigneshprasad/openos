import Image from "next/image"
import { DatabaseResourceForm } from "./DatabaseResourceForm"
import { StatementUploadForm } from "./StatementUploadForm"
import { RazorpayResourceForm } from "./RazorpayResourceForm"
import { StripeResourceForm } from "./StripeResourceForm"
import { MARIADB, POSTGRES, MYSQL } from "~/constants/dbTypes"
import { MixpanelResourceForm } from "./MixpanelResourceForm"

const INTEGRATIONS = [
    {
        key: "postgresql",
        title: "PostgreSQL",
        description: "Connect your database to create reports & retrieve data",
        imageSrc: "/postgresql.png",
        url: "https://www.postgresql.org/",
        button: <DatabaseResourceForm type={POSTGRES} />
    },
    {
        key: "mysql",
        title: "MySQL",
        description: "Connect your database to create reports & retrieve data",
        imageSrc: "/mysql.png",
        url: "https://www.mysql.com/",
        button: <DatabaseResourceForm type={MYSQL} />
    },
    {
        key: "mariadb",
        title: "Maria DB",
        description: "Connect your database to create reports & retrieve data",
        imageSrc: "/mariadb.png",
        url: "https://mariadb.org/",
        button: <DatabaseResourceForm type={MARIADB} />
    },
    {
        key: "razorpay",
        title: "Razorpay",
        description: "Use Razorpay to pull your financial data & create financial reports",
        imageSrc: "/razorpay.png",
        url: "https://razorpay.com/",
        button: <RazorpayResourceForm />
    },
    {
        key: "stripe",
        title: "Stripe",
        description: "Use Stripe to pull your financial data & create financial reports",
        imageSrc: "/stripe.png",
        url: "https://stripe.com/",
        button: <StripeResourceForm />
    },
    {
        key: "bankStatement",
        title: "Bank Statement",
        description: "A list of all transactions for a bank account over a set period, usually monthly",
        imageSrc: "/bank.png",
        url: "",
        button: <StatementUploadForm />
    },
    {
        key: "mixpanel",
        title: "Mixpanel",
        description: "Simple and powerful analytics tool",
        imageSrc: "/mixpanel.webp",
        url: "https://mixpanel.com/",
        button: <MixpanelResourceForm />
    },
]

export const IntegrationsList: React.FC = () => {
    return (
        <>
            {INTEGRATIONS.map((integration) => (
                <div className="h-max" key={integration.key}>
                    <div 
                        className="min-h-[100px] py-3 pl-3 pr-4 grid grid-cols-[max-content_1fr_max-content]
                        gap-4 items-start bg-[#1C1C1C] rounded-md"
                    >
                        <Image
                            src={integration.imageSrc} 
                            alt={integration.key}
                            width={32} 
                            height={32} 
                            className="mt-1 rounded" 
                        />
                        <div>
                            <h3 className="text-sm text-[#fff] font-semibold">
                                {integration.title}
                            </h3>
                            <p className="pt-1 pb-2 text-sm text-[#616161] font-medium">
                                {integration.description}
                            </p>
                            {integration.url && <a 
                                href={integration.url}
                                target="_blank" 
                                className="text-[#5EA3FB] text-sm font-normal hover:underline hover:underline-offset-2"
                            >
                                About this app
                            </a>}
                        </div>
                        <div>
                            {integration.button}
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}