import {NextApiRequest, NextApiResponse} from "next";
import {PrismaClient} from "@prisma/client";

// TO REMOVE FROM PRODUCTION
export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    const prisma = new PrismaClient();
    const competitions = await prisma.competition.findMany();
    res.status(200).json(competitions);
}
