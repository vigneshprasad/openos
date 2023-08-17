import Link from "next/link";
import DBIcon from "./icons/DBIcon";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import ExpandIcon from "./icons/Expand";
import ContractIcon from "./icons/Contract";

import { FaCode, FaBolt, FaBullhorn, FaRegHeart, FaTag, FaMoneyBillTrendUp, FaCartPlus } from "react-icons/fa6";

export type SideNavKeys = "terminal" | "create_model" | "growth_marketing" | "customer_success" | "sales_forecast" | "item_sales_forecast" | "revenue_forecast" | "integrations";

type IProps = {
    activeKey: SideNavKeys;
}

export const SideNavbar: React.FC<IProps> = ({ activeKey }) => {
    const { data: sessionData } = useSession();

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`${isOpen ? 'w-72' : 'w-16'} p-1 border-r border-border-colour flex flex-col absolute bg-white h-full z-50`}>
            {
                isOpen ?
                <div className="flex flex-row gap-3 mx-4 my-4 align-middle justify-between">
                    <div className="flex flex-row gap-3">
                        <label
                            tabIndex={0}
                            className="btn-ghost btn-circle avatar btn"
                            onClick={() => void signOut({ callbackUrl: '/auth/signin' })}
                        >
                            <div className="flex items-center bg-blue-card-background-colour rounded-sm w-8 h-8 justify-center font-medium">
                                {sessionData?.user?.name ? sessionData.user.name[0] : "A"}
                            </div>
                        </label>
                        <div className="my-auto font-medium">
                            {sessionData?.user?.name ? sessionData.user.name : "Anonymous"}
                        </div>
                    </div>
                    <div 
                        className="my-auto"
                        onClick={() => setIsOpen(!isOpen)}>
                        <ContractIcon className="text-light-grey-text-colour"/>
                    </div>
                </div>
            :
                <div>            
                    <div
                        className="flex w-12 h-12 items-center justify-center rounded-full mx-auto" 
                        onClick={() => setIsOpen(!isOpen)}>
                        <ExpandIcon className="text-light-grey-text-colour"/>
                    </div>
                    <label
                        tabIndex={0}
                        className="flex btn-ghost btn-circle avatar btn w-10 h-10 items-center justify-center mx-auto"
                        onClick={() => void signOut({ callbackUrl: '/auth/signin' })}
                    >
                        <div className="flex items-center bg-blue-card-background-colour rounded-full w-10 h-10 justify-center mt-2">
                            {sessionData?.user?.name ? sessionData.user.name[0] : "A"}
                        </div>
                    </label>
                </div>
            }
            {/* DATA EXPLORATION */}
            {isOpen ?
                <div className="py-4 mx-4 border-b border-border-colour">
                    <div className="mb-4 text-sm font-medium">Data Exploration</div>
                    <Link href={"/"}>
                        <div className="flex flex-row gap-3">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'terminal' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'terminal' ? <FaCode className="text-accent-colour" /> : <FaCode className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Natural Language to SQL</span>
                        </div>
                    </Link>
                </div>
            :   
                <div className="py-4 border-b border-border-colour">
                    <Link href={"/"}>
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'terminal' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'terminal' ? <FaCode className="text-accent-colour" /> : <FaCode className="text-light-text-colour" />}
                        </div>
                    </Link>
                </div>
            }
            {/* REGRESSION ANALYSIS */}
            {isOpen ?
                <div className="py-4 mx-4 border-b border-border-colour">
                    <div className="mb-4 text-sm font-medium">Regression Analysis</div>
                    <Link href={"/create_model"}>
                        <div className="flex flex-row gap-3 pb-2">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'create_model' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'create_model' ? <FaBolt className="text-accent-colour" /> : <FaBolt className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Build a Prediction Model</span>
                        </div>
                    </Link>
                    <Link href={"/growth_marketing"}>
                        <div className="flex flex-row gap-3 pb-2">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'growth_marketing' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'growth_marketing' ? <FaBullhorn className="text-accent-colour" /> : <FaBullhorn className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Growth and Marketing</span>
                        </div>
                    </Link>
                    <Link href={"/customer_success"}>
                        <div className="flex flex-row gap-3">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'customer_success' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'customer_success' ? <FaRegHeart className="text-accent-colour" /> : <FaRegHeart className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Sales and Customer Success</span>
                        </div>
                    </Link>
                </div>
            :
                <div className="py-4 border-b border-border-colour">
                    <Link href={"/create_model"} className="pb-2">
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'create_model' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'create_model' ? <FaBolt className="text-accent-colour" /> : <FaBolt className="text-light-text-colour" />}
                        </div>
                    </Link>
                    <Link href={"/growth_marketing"} className="pb-2">
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'growth_marketing' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'growth_marketing' ? <FaBullhorn className="text-accent-colour" /> : <FaBullhorn className="text-light-text-colour" />}
                        </div>
                    </Link>
                    <Link href={"/customer_success"}>
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'customer_success' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'customer_success' ? <FaRegHeart className="text-accent-colour" /> : <FaRegHeart className="text-light-text-colour" />}
                        </div>
                    </Link>
                </div>
            }

            {/* TIME SERIES FORECAST */}
            {isOpen ?
                <div className="py-4 mx-4 border-b border-border-colour">
                    <div className="mb-4 text-sm font-medium">Time Series Forecast</div>
                    <Link href={"/sales_forecast"}>
                        <div className="flex flex-row gap-3 pb-2">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'sales_forecast' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'sales_forecast' ? <FaTag className="text-accent-colour" /> : <FaTag className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Total Sales Forecast</span>
                        </div>
                    </Link>
                    <Link href={"/item_sales_forecast"}>
                        <div className="flex flex-row gap-3 pb-2">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'item_sales_forecast' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'item_sales_forecast' ? <FaCartPlus className="text-accent-colour" /> : <FaCartPlus className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Item Sales Forecast</span>
                        </div>
                    </Link>
                    <Link href={"/revenue_forecast"}>
                        <div className="flex flex-row gap-3">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'revenue_forecast' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'revenue_forecast' ? <FaMoneyBillTrendUp className="text-accent-colour" /> : <FaMoneyBillTrendUp className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Revenue Forecast</span>
                        </div>
                    </Link>
                </div>
            :
                <div className="py-4 border-b border-border-colour">
                    <Link href={"/sales_forecast"} className="pb-2">
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'sales_forecast' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'sales_forecast' ? <FaTag className="text-accent-colour" /> : <FaTag className="text-light-text-colour" />}
                        </div>
                    </Link>
                    <Link href={"/item_sales_forecast"} className="pb-2">
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'item_sales_forecast' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'item_sales_forecast' ? <FaCartPlus className="text-accent-colour" /> : <FaCartPlus className="text-light-text-colour" />}
                        </div>
                    </Link>
                    <Link href={"/revenue_forecast"} className="">
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'revenue_forecast' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'revenue_forecast' ? <FaMoneyBillTrendUp className="text-accent-colour" /> : <FaMoneyBillTrendUp className="text-light-text-colour" />}
                        </div>
                    </Link>
                    {/* <Link href={"/customer_success"}>
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'customer_success' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'customer_success' ? <FaRegHeart className="text-accent-colour" /> : <FaRegHeart className="text-light-text-colour" />}
                        </div>
                    </Link> */}
                </div>
            }

            {/* ACCOUNT */}
            {isOpen ?
                <div className="py-4 mx-4 border-b border-border-colour">
                    <div className="mb-4 text-sm font-medium">Account</div>
                    <Link href={"/integrations"}>
                        <div className="flex flex-row gap-3">
                            <div className={`flex w-8 h-8 items-center justify-center ${activeKey === 'integrations' ? "bg-button-active-state" : ""} rounded-full`}>
                                {activeKey === 'integrations' ? <DBIcon className="text-accent-colour" /> : <DBIcon className="text-light-text-colour" />}
                            </div>
                            <span className="text-sm text-light-text-colour my-auto">Connect a Data Source</span>
                        </div>
                    </Link>
                </div>
            :
                <div className="py-4 border-b border-border-colour">
                    <Link href={"/integrations"} className="">
                        <div className={`flex flex-col w-10 h-10 mx-auto items-center justify-center ${activeKey === 'integrations' ? "bg-button-active-state" : ""} rounded-full `}>
                            {activeKey === 'integrations' ? <DBIcon className="text-accent-colour" /> : <DBIcon className="text-light-text-colour" />}
                        </div>
                    </Link>
                </div>
            }

        </div>
    )
}