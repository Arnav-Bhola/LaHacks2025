"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className='min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'>
      <header className='py-8 bg-gray-200 dark:bg-gray-800 shadow-md'>
        <div className='container mx-auto px-4'>
          <h1 className='text-4xl font-bold text-center'>CrashGuard</h1>
          <p className='text-center mt-2 text-gray-600 dark:text-gray-400'>
            Your ultimate portfolio risk management tool.
          </p>
        </div>
      </header>

      <section className='flex-grow flex items-center justify-center'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-2xl font-semibold mb-6'>Manage Your Portfolio with Confidence</h2>
          <p className='text-gray-700 dark:text-gray-300 mb-8'>
            CrashGuard helps you analyze risks, predict market trends, and make informed decisions.
          </p>
          <div className='flex flex-row gap-6 items-center justify-center'>
            <button
              onClick={() => router.push("/portfolio")}
              className='px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600'
            >
              Analyze Portfolio with Latest Market Events
            </button>
          </div>
        </div>
      </section>

      <footer className='py-6 bg-gray-200 dark:bg-gray-800'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            © 2025 CrashGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

