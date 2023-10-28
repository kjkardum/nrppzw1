import {z} from "zod";
import {prismaClient} from "@/services/prismaClient";
import {getSession} from "@auth0/nextjs-auth0";
import {fillRobinModelsDb, generateRoundRobin} from "@/services/roundRobinGenerator";
import {Result, ResultAsync} from "neverthrow";

const createGameSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    competitors: z
        .array(z.string().min(1))
        .min(4).max(8)
        .refine((arr) => new Set(arr).size === arr.length, {
            message: "Competitors must have unique names",
        }),
    winPoints: z.number(),
    drawPoints: z.number(),
    losePoints: z.number(),
});
export const POST = async (req: Request) => {
    const session = await getSession();
    if (!session || !session.user) {
        return new Response(JSON.stringify({message: "You must be logged in to view this page"}), {status: 401});
    }
    const body = await req.json();
    const validatedBodyResult = Result.fromThrowable(() => createGameSchema.parse(body))();
    if (validatedBodyResult.isErr()) {
        return new Response(JSON.stringify(validatedBodyResult.error, null, 2), {status: 400})
    }
    const validatedBody = validatedBodyResult.value;
    const game = await ResultAsync.fromPromise(prismaClient.competition.create({
        data: {
            name: validatedBody.name,
            description: validatedBody.description,
            winPoints: validatedBody.winPoints,
            drawPoints: validatedBody.drawPoints,
            losePoints: validatedBody.losePoints,
            ownerId: session.user.sub,
            players: {
                create: validatedBody.competitors.map((name) => ({name})),
            }
        },
        include: {
            players: true
        }
    }), err => err as Error);
    if (game.isErr()) {
        console.error(game.error);
        return Response.json({message: "Failed to create game"}, {status: 500});
    }
    const roundsResult = generateRoundRobin(validatedBody.competitors.length);
    if (roundsResult.isErr()) {
        console.error(roundsResult.error);
        return Response.json({message: "Bad game request, can't match players"}, {status: 400});
    }
    const resultFill = await ResultAsync.fromPromise(fillRobinModelsDb(game.value, roundsResult.value), err => err as Error);
    if (resultFill.isErr()) {
        console.error(resultFill.error);
        return Response.json({message: "Failed to create game matches. Game is partially created. Please contact administrator"}, {status: 500});
    }
    const gameDeepResult = await ResultAsync.fromPromise(prismaClient.competition.findUnique({
        where: {
            id: game.value.id
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
    }), err => err as Error);
    if (gameDeepResult.isErr()) {
        console.error(gameDeepResult.error);
        return Response.json({message: "Game succesfully created, but can't be returned. Try retrieving it again."}, {status: 500});
    }
    return Response.json(gameDeepResult.value);
}

export const GET = async (req: Request) => {
    const session = await getSession();
    if (!session || !session.user) {
        return new Response(JSON.stringify({message: "You must be logged in to view this page"}));
    }
    const games = await prismaClient.competition.findMany({
        where: {
            ownerId: session.user.sub
        },
        orderBy: {
            id: 'desc'
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
    return Response.json(games);
}
