import { type NextPage } from "next";
import Head from "next/head";

import { Navbar } from "~/components/Navbar";

const GenerateMIS: NextPage = () => {
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
                        YO YO TEST
                    </div>
                </div>
            </main>
        </>
    );
};

export default GenerateMIS;
