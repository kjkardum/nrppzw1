'use client'
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {ResultEnum} from "@/types/resultEnum";
import {ResultAsync} from "neverthrow";

export default function GamePage({params}: { params: { gameId: string } }) {
    const [gameData, setGameData] = useState(null as any)
    const [submitting, setSubmitting] = useState(false)
    const gameId = Number(params.gameId) || null
    const router = useRouter()
    const round = gameData?.rounds.toSorted((a: any, b: any) => a.order - b.order).find((r: any) => !r.completed)
    const submit = async (complete: boolean) => {
        setSubmitting(true)
        const callResult = await ResultAsync.fromPromise(fetch(`/api/game/${gameId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                round: {
                    completed: complete,
                    matches: round.matches.map((match: any) => ({
                        id: match.id,
                        result: match.resultEnum,
                        name: match.name,
                        description: match.description
                    }))
                }
            })
        }), (error) => error as Error);
        if (callResult.isErr()) {
            console.error('error sending request')
            console.error(callResult.error)
            return
        }
        const jsonResult = await ResultAsync.fromPromise(callResult.value.json(), (error) => error as Error);
        if (jsonResult.isErr()) {
            console.error('error parsing response')
            console.error(jsonResult.error)
            return
        }
        console.log(jsonResult.value, 'jsonResult')
        if (callResult.value.status !== 200) {
            jsonResult.value.issues.forEach((issue: any) => {
                console.error(issue)
            })
            return
        }
        await ResultAsync.fromPromise(loadData(), (error) => error as Error);
        setSubmitting(false);
    }
    const complete = () => submit(true);
    const save = () => submit(false);
    const loadData = async () => {
        if (!gameId) return;
        await fetch('/api/game/' + gameId)
            .then(response => response.json())
            .then(data => setGameData(data));
    };
    useEffect(() => {
        loadData();
    }, [gameId])

    const disableComplete = round?.matches.some((match: any) => match.resultEnum === ResultEnum.None);
    return (
        gameData ? (
                <main className="flex min-h-screen flex-col items-center justify-between p-24">
                    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                        <p
                            onClick={() => router.push('/')}
                            className="fixed right-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 cursor-pointer">
                            {'< ' + gameData?.name}
                        </p>
                        <div
                            className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                            {gameData.description}
                        </div>
                    </div>
                    <article className='prose lg:prose-xl dark:prose-invert w-full'>
                        <h2 className='text-center'>Current round {round.order}</h2>
                        <table className={"table-auto"}>
                            <thead>
                            <tr>
                                <th className={'w-1/6'}>Player 1</th>
                                <th className={'w-1/6'}>Result</th>
                                <th className={'border-r-2 border-gray-600 w-1/6'}>Player 2</th>
                                <th className={'w-1/4'}>Name</th>
                                <th className={'w-1/4'}>Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {round.matches.map((match: any) => (
                                <tr key={match.id}>
                                    <td>{match.firstPlayer.name}</td>
                                    <td className='hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'>
                                        <select
                                            onChange={(e: any) => {
                                                setGameData((gd: any) => ({
                                                    ...gd,
                                                    rounds: gd.rounds.map((r: any) => ({
                                                        ...r,
                                                        matches: r.matches.map((m: any) => m.id === match.id ? ({
                                                            ...m,
                                                            resultEnum: Number(e.target.value)
                                                        }) : m)
                                                    }))
                                                }))
                                            }}
                                            className='bg-transparent border-none w-full' name={`result-${match.id}`}>
                                            <option value={ResultEnum.None}>None</option>
                                            <option value={ResultEnum.First}>Player 1</option>
                                            <option value={ResultEnum.Draw}>Draw</option>
                                            <option value={ResultEnum.Second}>Player 2</option>
                                        </select>
                                    </td>
                                    <td className={'border-r-2 border-gray-600'}>{match.secondPlayer.name}</td>
                                    <td>
                                        <input
                                            onChange={(e: any) => {
                                                setGameData((gd: any) => ({
                                                    ...gd,
                                                    rounds: gd.rounds.map((r: any) => ({
                                                        ...r,
                                                        matches: r.matches.map((m: any) => m.id === match.id ? ({
                                                            ...m,
                                                            name: e.target.value
                                                        }) : m)
                                                    }))
                                                }))
                                            }}
                                            className='bg-transparent border-none w-full' name={`name-${match.id}`}
                                            defaultValue={match.name}/>
                                    </td>
                                    <td>
                                        <input
                                            onChange={(e: any) => {
                                                setGameData((gd: any) => ({
                                                    ...gd,
                                                    rounds: gd.rounds.map((r: any) => ({
                                                        ...r,
                                                        matches: r.matches.map((m: any) => m.id === match.id ? ({
                                                            ...m,
                                                            description: e.target.value
                                                        }) : m)
                                                    }))
                                                }))
                                            }}
                                            className='bg-transparent border-none w-full' name={`description-${match.id}`}
                                            defaultValue={match.description}/>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button
                            disabled={submitting}
                            onClick={save}
                            className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mr-1'>
                            Save
                        </button>
                        <button
                            onClick={complete}
                            disabled={disableComplete || submitting}
                            className={`bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mr-1 ${disableComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Save and complete
                        </button>
                        <a
                            target='_blank'
                            href={`/game/${gameId}/leaderboard`}
                            className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'>
                            View leaderboard
                        </a>
                        {disableComplete && <><br/><span className='text-xs text-gray-500'>{`* You can't complete the round until all matches have a result`}</span></>}
                        {submitting && <><br/><span className='text-xs text-gray-500'>Submitting...</span></>}
                    </article>
                </main>
            ) :
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                    <h1>Game loading...</h1>
                </div>
            </main>
    )
}
