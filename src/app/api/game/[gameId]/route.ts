// game/[gameId]/route.ts
import {getSession} from "@auth0/nextjs-auth0";
import {Result} from "neverthrow";
import {NextRequest} from "next/server";
import {z} from "zod";
import {ResultEnum} from "@/types/resultEnum";

const updateGameSchema = z.object({
    round: z.object({
        completed: z.boolean(),
        matches: z.array(z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            result: z.number().int().min(0).max(2),
        }))
    })
});

export const PATCH = async (req: NextRequest) => {
    const session = await getSession();
    if (!session || !session.user) {
        return new Response(JSON.stringify({message: "You must be logged in to view this page"}));
    }
    const body = await req.json();
    const gameId = req.nextUrl.searchParams.get('gameId');
    if (!gameId) {
        return new Response(JSON.stringify({message: "Missing game identifier"}), {status: 400});
    }
    const validatedBodyResult = Result.fromThrowable(() => updateGameSchema.parse(body))();

}
