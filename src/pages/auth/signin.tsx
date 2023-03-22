import { type NextPage } from "next";
import Head from "next/head";
import { signIn } from "next-auth/react";
// import { redirect } from 'next/navigation';
// import { useEffect } from "react";

const Home: NextPage = () => {
//   const { data: sessionData } = useSession();

//   useEffect(() => {
//     if(!sessionData?.user) {
//       redirect('/login');
//     }
//   }, [sessionData?.user]);

  return (
    <>
      <Head>
        <title>Open OS</title>
        <meta name="description" content="Tools to make your life easier" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Open <span className="text-[hsl(280,100%,70%)]">OS</span> 
          </h1>
          <div className="flex flex-col items-center gap-2">
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signIn('google', { callbackUrl: '/' })}
      >
        Sign In
      </button>
    </div>
  );
};
