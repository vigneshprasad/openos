import { type NextPage } from "next";
import Head from "next/head";
import { Navbar } from "~/components/Navbar";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { DatabaseResourceForm } from "~/components/DatabaseResourceForm";
import Link from "next/link";
import { RazorpayResourceForm } from "~/components/RazorpayResourceForm";

const SelectResource: NextPage = () => {

    const { data: sessionData } = useSession();
    const { data: databaseResource } = api.databaseResource.getAll.useQuery(
        undefined, 
        { enabled: sessionData?.user !== undefined}
    );

    return (
        <>
            <Head>
                <title>Open OS Generate MIS</title>
                <meta name="description" content="Tools to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                <Navbar />
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <h1 className="text-white"> Choose a Resource </h1>
                    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                        {databaseResource?.map((resource) => (
                            <Link 
                                key={resource.id} 
                                href={{
                                    pathname: `/reports/mis/selectTemplate`,
                                    query: {
                                        resource: resource.id
                                    }
                                }}
                                className="text-white">
                                <p>{resource.name}</p>
                            </Link>
                        ))}
                        <DatabaseResourceForm />
                        <RazorpayResourceForm />
                    </div>
                </div>
            </main>
        </>
    );
};

export default SelectResource;
