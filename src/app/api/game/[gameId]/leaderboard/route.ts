import {prismaClient} from "@/services/prismaClient";
import {ResultEnum} from "@/types/resultEnum";

export const GET = async (req: Request, {params}: { params: { gameId: string } }) => {
    const gameId = Number(params.gameId) || null;
    if (!gameId) {
        return Response.json({message: "Missing game identifier"}, {status: 400});
    }
    const game = await prismaClient.competition.findUnique({
        where: {
            id: gameId
        },
        include: {
            players: true,
            rounds: {
                include: {
                    matches: {
                        include: {
                            firstPlayer: true,
                            secondPlayer: true,
                        }
                    }
                }
            }
        }
    });

    if (!game) {
        return Response.json({message: "Game not found"}, {status: 404});
    }

    const rounds = game.rounds.filter(round => round.completed);
    const players = game.players.map(player => ({
        id: player.id,
        name: player.name,
        points: 0,
    }));
    const [winPoints, drawPoints, losePoints] = [game.winPoints, game.drawPoints, game.losePoints];
    rounds.forEach(round => {
        round.matches.forEach(match => {
            const firstPlayer = players.find(player => player.id === match.firstPlayerId)!;
            const secondPlayer = players.find(player => player.id === match.secondPlayerId)!;
            if (match.resultEnum === ResultEnum.First) {
                firstPlayer.points += winPoints;
                secondPlayer.points += losePoints;
            } else if (match.resultEnum === ResultEnum.Second) {
                firstPlayer.points += losePoints;
                secondPlayer.points += winPoints;
            } else if (match.resultEnum === ResultEnum.Draw) {
                firstPlayer.points += drawPoints;
                secondPlayer.points += drawPoints;
            }
        });
    });
    players.sort((a, b) => b.points - a.points);
    return Response.json({
        gameId: game.id,
        name: game.name,
        description: game.description,
        rounds,
        unplayedRounds: game.rounds.filter(round => !round.completed)
            .map(round => ({
                id: round.id,
                matches: round.matches.map(match => ({
                    id: match.id,
                    firstPlayerName: match.firstPlayer.name,
                    secondPlayerName: match.secondPlayer.name,
                }))
            })),
        leaderboard:
        players,
    })
        ;
}
