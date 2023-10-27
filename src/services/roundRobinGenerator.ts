import {Prisma} from "@prisma/client";
import {ResultEnum} from "@/types/resultEnum";
import {prismaClient} from "@/services/prismaClient";
import {err, ok, Result} from "neverthrow";

type RobinRound = {
    roundNumber: number,
    matches: Array<[number, number]>
}

export const generateRoundRobin = (numberOfPlayers: number): Result<Array<RobinRound>, Error> => {
    if (numberOfPlayers < 4 || numberOfPlayers > 8) {
        return err(new Error('Number of players must be between 4 and 8'));
    }

    const players = Array.from(Array(numberOfPlayers).keys());
    if (numberOfPlayers % 2 === 1) {
        players.push(-1);
        numberOfPlayers++;
    }
    const rounds: Array<RobinRound> = [];
    const numberOfRounds = numberOfPlayers - 1;
    const numberOfMatchesPerRound = numberOfPlayers / 2;
    for (let i = 0; i < numberOfRounds; i++) {
        const matches: [number, number][] = [];
        for (let j = 0; j < numberOfMatchesPerRound; j++) {
            matches.push([players[j], players[numberOfPlayers - 1 - j]]);
        }
        rounds.push({
            roundNumber: i + 1,
            matches
        });
        players.splice(1, 0, players.pop()!);
    }
    return ok(rounds);
}

type CompetitionFull = Prisma.CompetitionGetPayload<{
    include: {
        players: true
    }
}>

export const fillRobinModelsDb = async (competition: CompetitionFull, robinRounds: Array<RobinRound>): Promise<void> => {
    const players = competition.players;
    if (!players || players.length === 0) {
        throw new Error('Competition has no players');
    }

    for (let roundIndex = 0; roundIndex < robinRounds.length; roundIndex++) {
        const round = robinRounds[roundIndex];
        const roundNumber = roundIndex + 1;
        const roundDb = await prismaClient.round.create({
            data: {
                name: 'Round ' + roundNumber,
                order: roundNumber,
                competition: {
                    connect: {
                        id: competition.id
                    }
                }
            }
        });

        for (let matchIndex = 0; matchIndex < round.matches.length; matchIndex++) {
            const match = round.matches[matchIndex];
            const matchNumber = matchIndex + 1;
            if (match[0] === -1 || match[1] === -1) {
                continue;
            }
            const matchDb = await prismaClient.match.create({
                data: {
                    name: 'Match ' + matchNumber + ' of Round ' + roundNumber,
                    order: matchNumber,
                    resultEnum: ResultEnum.None,
                    firstPlayer: {
                        connect: {
                            id: players[match[0]].id
                        }
                    },
                    secondPlayer: {
                        connect: {
                            id: players[match[1]].id
                        }
                    },
                    round: {
                        connect: {
                            id: roundDb.id
                        }
                    }
                }
            });
        }
    }
}
