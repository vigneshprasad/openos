import { type NextPage } from "next";
import Head from "next/head";
import { Navbar } from "~/components/Navbar";

import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";

const SelectTemplate: NextPage = () => {

    const router = useRouter();
    const { resource } = router.query;
    const { data: templates } = api.template.getAll.useQuery();

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
                    <h1 className="text-white"> Choose a Template </h1>
                    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                        {templates?.map((template) => (
                            <Link 
                                key={template.id} 
                                href={{
                                    pathname: `/reports/mis/generateMIS`,
                                    query: {
                                        resource: resource,
                                        template: template.id
                                    }
                                }}
                                className="text-white">
                                <p>{template.name}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
};

export default SelectTemplate;
