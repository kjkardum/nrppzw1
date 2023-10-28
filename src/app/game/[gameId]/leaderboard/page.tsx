'use client'
import {useEffect, useState} from "react";
import {ResultEnum} from "@/types/resultEnum";

export default function LeaderboardPage({params}: { params: { gameId: string } }) {
    const [gameData, setGameData] = useState(null as any)
    const gameId = Number(params.gameId) || null
    const loadData = async () => {
        if (!gameId) return;
        await fetch(`/api/game/${gameId}/leaderboard`)
            .then(response => response.json())
            .then(data => setGameData(data));
    };
    useEffect(() => {
        loadData();
    }, [gameId])

    const result = (resultEnum: ResultEnum) => {
        switch (resultEnum) {
            case ResultEnum.First:
                return 'First player wins'
            case ResultEnum.Second:
                return 'Second player wins'
            case ResultEnum.Draw:
                return 'Draw'
            default:
                return 'Unknown result'
        }
    }

    return !gameData
        ? <main><h1>Loading leaderboard...</h1></main>
        : (
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <article className='prose lg:prose-xl dark:prose-invert w-full'>
                    <h1>Leaderboard for {gameData.name}</h1>
                    <p>{gameData.description}</p>
                    <table className={"table-auto"}>
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Competitor</th>
                            <th>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.leaderboard.map((leaderboardItem: any, index: number) => (
                            <tr key={leaderboardItem.id}>
                                <td>{index + 1}</td>
                                <td>{leaderboardItem.name}</td>
                                <td>{leaderboardItem.points}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h2>Completed rounds and matches</h2>
                    {gameData.rounds.map((round: any) => (
                        <div key={round.id}>
                            <h3>Round {round.order}</h3>
                            <table className={"table-auto"}>
                                <thead>
                                <tr>
                                    <th>Match</th>
                                    <th>Result</th>
                                </tr>
                                </thead>
                                <tbody>
                                {round.matches.map((match: any) => (
                                    <tr key={match.id}>
                                        <td>{match.firstPlayer.name} vs {match.secondPlayer.name}</td>
                                        <td>{result(match.resultEnum)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </article>
            </main>
        )
}
