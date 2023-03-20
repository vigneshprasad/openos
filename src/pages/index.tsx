import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Navbar } from "~/components/Navbar";
import { api } from "~/utils/api";

type TableRow = {
    [key: string]: string | number | boolean | null;
}

type QueryAndResult = {
    query: string;
    count: number;
    result: TableRow[];
    name: string;
}

const Home: NextPage = () => {

    const [data, setData] = useState<QueryAndResult>();
    const [command, setCommand] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const runQuery = api.queryRouter.runQuery.useMutation({
        onSuccess: (data) => {
            setSuccess(true);
            setData(data as unknown as QueryAndResult);
            setError(false);
            setLoading(false);
        },
        onError: (err) => {
            setSuccess(false);
            setError(true);
            setErrorMessage(err.message);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);

        void runQuery.mutate({
            query: command,
        });
    };


    return (
        <>
        <Head>
            <title>Open OS</title>
            <meta name="description" content="Tools to make your life easier" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            <Navbar />
            <div className="flex min-h-screen flex-col items-center">
                <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                        Open <span className="text-[hsl(280,100%,70%)]">OS</span> 
                    </h1>
                    <div className="flex items-center gap-2 text-white w-full">
                        <form className="w-full" onSubmit={handleSubmit}>
                            <fieldset className="Fieldset w-full">
                                <label className="Label">
                                    <span>Write Query</span>
                                    <input
                                        className="Input" 
                                        type="text"
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                    />
                                </label>
                            </fieldset>
                            <div className="mt-25 mb-25">
                                {loading ?
                                    <button type="submit" disabled className="Button grey">Loading...</button>
                                    :
                                    <button type="submit" className="Button green">Generate</button>
                                }
                            </div>
                        </form>
                    </div>
                    {data?.query && <div className="text-white">
                        <h3> Your question was converted to SQL as </h3>
                        <h3> {data.query} </h3>
                        <br />
                    </div>}
                    <div className="flex flex-col text-white w-full text-center">
                        {
                            data?.result && data.result.length > 0 &&
                            <div className="w-full max-w-screen overflow-x-auto">
                                <table className="w-full max-w-screen overflow-x-auto">
                                    <tr>
                                        {
                                            data?.result && 
                                            data.result.length > 1 && 
                                            Object.keys(data?.result[0] as TableRow).map(
                                                (key: string) => {
                                                    return (
                                                        <th key={key}>{key}</th>
                                                    )
                                                }
                                            )
                                        }
                                    </tr>
                                    {data?.result && data.result.map((row: TableRow, index:number) => (
                                        <tr key={index}>
                                            {Object.keys(row).map((key: string) => {
                                                console.log(row[key]);
                                                return (      
                                                    <td key={key}>{row[key]?.toString()}</td>
                                                )}
                                            )}
                                        </tr>
                                    ))}
                                </table>
                            </div>
                        }
                        {
                            data?.count &&
                            <h1> Query Result: {data.count} </h1>
                        }

                        <div className="flex justify-content-end mt-8">
                            {success && <p className="text-green-500">Success</p>}
                            {error && <p className="text-red-500">Error</p>}
                        </div>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
};

export default Home;
