import {PrismaClient} from "@prisma/client";
import {getSession} from "@auth0/nextjs-auth0";

// TO REMOVE FROM PRODUCTION
export const GET = async (req: Request) => {
    const session = await getSession();
    const prisma = new PrismaClient();
    const competitions = await prisma.competition.findMany();
    if (session) {
        return new Response(JSON.stringify({
            dbCompetitions: competitions,
            user: session.user
        }, null, 2));
    }
    return new Response(JSON.stringify({message: "You must be logged in to view this page"}));
}
