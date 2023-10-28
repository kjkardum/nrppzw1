import {getSession} from "@auth0/nextjs-auth0";
import {Result} from "neverthrow";
import {NextRequest} from "next/server";
import {z} from "zod";
import {prismaClient} from "@/services/prismaClient";

const updateGameSchema = z.object({
    round: z.object({
        completed: z.boolean(),
        matches: z.array(z.object({
            id: z.number().int(),
            name: z.string(),
            description: z.string().nullable().optional(),
            result: z.number().int().min(0).max(3),
        }))
    })
});

export const PATCH = async (req: NextRequest, {params}: { params: {gameId: string} }) => {
    const session = await getSession();
    if (!session || !session.user) {
        return Response.json({message: "You must be logged in to view this page"}, {status: 401});
    }
    const body = await req.json();
    const gameId = Number(params.gameId) || null;
    if (!gameId) {
        return Response.json({message: "Missing game identifier"}, {status: 400});
    }
    const validatedBodyResult = Result.fromThrowable(() => updateGameSchema.parse(body))();
    if (validatedBodyResult.isErr()) {
        return Response.json(validatedBodyResult.error, {status: 400})
    }
    const validatedBody = validatedBodyResult.value;

    const game = await prismaClient.competition.findUnique({
        where: {
            id: gameId
        },
        include: {
            players: true,
            rounds: {
                where: {
                    completed: false
                },
                include: {
                    matches: true
                }
            }
        }
    });
    if (!game) {
        return Response.json({message: "Game not found"}, {status: 404});
    }

    if (game.ownerId !== session.user.sub) {
        return Response.json({message: "You are not the owner of this game"}, {status: 403});
    }

    const round = [...game.rounds].sort((f,s) => f.order - s.order).find((round) => !round.completed);
    if (!round) {
        return Response.json({message: "Game is already completed"}, {status: 400});
    }
    const matches = [...round.matches].sort((f,s) => f.order - s.order);
    if (matches.length !== validatedBody.round.matches.length) {
        return Response.json({message: "Invalid number of matches"}, {status: 400});
    }

    const matchIdsBody = [...validatedBody.round.matches.map((match) => match.id)].sort();
    const matchIdsDb = [...matches.map((match) => match.id)].sort();
    if (matchIdsBody.join() !== matchIdsDb.join()) {
        return Response.json({message: "Invalid matches identifiers"}, {status: 400});
    }

    await prismaClient.$transaction([
        ...validatedBody.round.matches.map((match) => prismaClient.match.update({
            where: {
                id: match.id
            },
            data: {
                name: match.name,
                description: match.description,
                resultEnum: match.result,
            }
        })),
        prismaClient.round.update({
            where: {
                id: round.id
            },
            data: {
                completed: validatedBody.round.completed
            }
        })
    ]);

    return Response.json({message: "Game updated"});
}

export const GET = async (req: Request, {params}: { params: {gameId: string} }) => {
    const session = await getSession();
    if (!session || !session.user) {
        return Response.json({message: "You must be logged in to view this page"}, {status: 401});
    }
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

    if (game.ownerId !== session.user.sub) {
        return Response.json({message: "You are not the owner of this game"}, {status: 403});
    }

    return Response.json(game);
}
