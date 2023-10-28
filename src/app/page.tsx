'use client'

import Typewriter from 'typewriter-effect';
import {useUser} from "@auth0/nextjs-auth0/client";
import {LoggedInHomepage} from "@/components/loggedInHomepage";

export default function Home() {
    const {user, error, isLoading} = useUser();
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <a
                    href={user ? '/api/auth/logout' : '/api/auth/login'}
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                >
                    <h2 className="mb-3 text-2xl font-semibold">
                        {user ? 'Logout ' : 'Login '}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">&gt;</span>
                    </h2>
                    <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                        {user ? 'See you soon' : 'Start creating competitions'}
                    </p>
                </a>
            </div>
            {user ? <LoggedInHomepage/> : (

                <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <pre>
                    <Typewriter
                        onInit={(typewriter) => {
                            typewriter
                                .changeDelay(50)
                                .typeString('Welcome to NRPPZW Matchmaker!')
                                .pauseFor(1000)
                                .deleteAll()
                                .typeString('Create and manage competitions...')
                                .pauseFor(1000)
                                .deleteAll()
                                .typeString('Record match results...')
                                .pauseFor(1000)
                                .deleteAll()
                                .typeString('Provide public leaderboards...')
                                .pauseFor(1000)
                                .deleteAll()
                                .typeString('To start, please login!')
                                .start();
                        }}
                    />
                </pre>
                </div>
            )}
        </main>
    )
}
