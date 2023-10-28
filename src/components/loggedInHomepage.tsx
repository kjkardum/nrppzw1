import {useEffect, useState} from "react";
import {ResultEnum} from "@/types/resultEnum";
import {useRouter} from "next/navigation";
import {FormProvider, SubmitHandler, useForm} from "react-hook-form";
import {ResultAsync} from "neverthrow";

export const LoggedInHomepage = () => {
    const router = useRouter()
    const setGame = (game: any) => router.push(`/game/${game.id}`)

    const [gamesData, setGamesData] = useState([] as any[])
    useEffect(() => {
        fetch('/api/game')
            .then(response => response.json())
            .then(data => setGamesData(data));
    }, [])

    const initialValues = {
        name: '',
        description: '',
        competitors: [] as string[],
        winPoints: 3,
        drawPoints: 1,
        losePoints: 0,
    }
    const methods = useForm<typeof initialValues>({defaultValues: initialValues});
    const {register, handleSubmit, watch, setValue, formState: {errors}, setError, clearErrors} = methods;

    useEffect(() => {
        const subscription = watch((value, {name, type}) => clearErrors(name))
        return () => subscription.unsubscribe()
    }, [watch])

    const onSubmit: SubmitHandler<typeof initialValues> = async (data, event) => {
        console.log('submitting');
        const callResult = await ResultAsync.fromPromise(fetch('/api/game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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
        if (callResult.value.status === 400) {
            jsonResult.value.issues.forEach((issue: any) => {
                setError(issue.path[0], {
                    type: 'manual',
                    message: issue.message
                })
            });
        } else {
            setGamesData([jsonResult.value, ...gamesData])
            setGame(jsonResult.value)
        }
    };

    return (
        <article className='prose lg:prose-xl dark:prose-invert'>
            {gamesData ? (
                <>
                    <h1>Your games</h1>
                    <table className={"table-auto"}>
                        <thead>
                        <tr>
                            <th>Game</th>
                            <th>Players</th>
                            <th>Round</th>
                            <th>Matches</th>
                            <th>Mode</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gamesData.map((game) => (
                            <tr key={game.id} className='hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                                onClick={() => setGame(game)}>
                                <td>{game.name}</td>
                                <td>{game.players.map((t: any) => t.name).join(', ')}</td>
                                <td>{game.rounds.filter((round: any) => round.completed).length}/{game.rounds.length}</td>
                                <td>{game.rounds.flatMap((round: any) => round.matches).filter((match: any) => match.resultEnum !== ResultEnum.None).length}/{game.rounds.flatMap((round: any) => round.matches).length}</td>
                                <td>{game.winPoints}/{game.drawPoints}/{game.losePoints}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            ) : <h1>You have no games, start a new one</h1>}
            <h1>Create a new game</h1>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, err => console.error(err))}>
                    <div className={'mb-4'}>
                        <label htmlFor="name"
                               className={'block mb-2 text-sm font-medium text-gray-900 dark:text-white'}>Name</label>
                        <input id="name" type="text" {...register("name")}
                               className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}/>
                        {errors.name?.message}
                    </div>
                    <div className={'mb-4'}>
                        <label htmlFor="description"
                               className={'block mb-2 text-sm font-medium text-gray-900 dark:text-white'}>Description</label>
                        <input id="description" type="text" {...register("description")}
                               className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}/>
                        {errors.description?.message}
                    </div>
                    <div className={'mb-4'}>
                        <label htmlFor="competitors"
                               className={'block mb-2 text-sm font-medium text-gray-900 dark:text-white'}>Competitors</label>
                        <ul>
                            {watch("competitors").map((competitor: string, index: number) => (
                                <li key={index}
                                    className='hover:bg-gray-100 dark:hover:bg-gray-800 hover:line-through cursor-pointer'
                                    onClick={() => setValue("competitors", watch("competitors").filter((c: string) => c !== competitor))}>
                                    {competitor}
                                </li>
                            ))}
                        </ul>
                        <input
                            className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}
                            type="text" onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setValue("competitors", [...watch("competitors"), e.currentTarget.value])
                                e.currentTarget.value = ''
                                e.preventDefault()
                            }
                        }}/>
                        {errors.competitors?.message}
                    </div>
                    <div className={'mb-4'}>
                        <label htmlFor="winPoints"
                               className={'block mb-2 text-sm font-medium text-gray-900 dark:text-white'}>Win
                            points</label>
                        <input id="winPoints" type="number" {...register("winPoints", {valueAsNumber: true})} step="any"
                               className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}/>
                        {errors.winPoints?.message}
                    </div>
                    <div className={'mb-4'}>
                        <label htmlFor="drawPoints"
                               className={'block mb-2 text-sm font-medium text-gray-900 dark:text-white'}>Draw
                            points</label>
                        <input id="drawPoints" type="number" {...register("drawPoints", {valueAsNumber: true})} step="any"
                               className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}/>
                        {errors.drawPoints?.message}
                    </div>
                    <div className={'mb-4'}>
                        <label htmlFor="losePoints"
                               className={'block mb-2 text-sm font-medium text-gray-900 dark:text-white'}>Lose
                            points</label>
                        <input id="losePoints" type="number" {...register("losePoints", {valueAsNumber: true})} step="any"
                               className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}/>
                        {errors.losePoints?.message}
                    </div>
                    <div className={'mb-4'}>
                        <input type="submit"/>
                    </div>
                </form>
            </FormProvider>
        </article>
    )
}
