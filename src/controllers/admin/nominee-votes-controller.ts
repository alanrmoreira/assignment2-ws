import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

export const nomineeVotesController = {
    async totalsByEdition(req: Request, res: Response) {
        const eventEditionId = Number(req.params.id);
        if (!Number.isFinite(eventEditionId)) {
            return res.status(400).json({ error: "Invalid event edition id" });
        }

        const awardIdFilter = req.query.awardId ? Number(req.query.awardId) : undefined;
        if (req.query.awardId && !Number.isFinite(awardIdFilter)) {
            return res.status(400).json({ error: "Invalid awardId" });
        }

        const nominees = await prisma.nominee.findMany({
            where: {
                award: {
                    event_edition_id: eventEditionId,
                    ...(awardIdFilter ? { id: awardIdFilter } : {})
                }
            },
            include: {
                award: {
                    select: { id: true, category_name: true, event_edition_id: true }
                },
                user_in_event: {
                    select: { id: true, user_name: true, user_email: true }
                },
                _count: {
                    select: { votes: true }
                }
            },
            orderBy: [
                { award_id: "asc" },
                { id: "asc" }
            ]
        });

        const byAward = new Map<number, {
            award_id: number;
            award_category_name: string;
            nominees: Array<{
                nominee_id: number;
                user_in_event_id: number;
                user_name: string;
                user_email: string;
                votes: number;
            }>;
        }>();

        for (const n of nominees) {
            const key = n.award.id;
            if (!byAward.has(key)) {
                byAward.set(key, {
                    award_id: n.award.id,
                    award_category_name: n.award.category_name,
                    nominees: []
                });
            }
            byAward.get(key)!.nominees.push({
                nominee_id: n.id,
                user_in_event_id: n.user_in_event.id,
                user_name: n.user_in_event.user_name,
                user_email: n.user_in_event.user_email,
                votes: n._count.votes
            });
        }

        const awards = [...byAward.values()].map(a => {
            const sorted = a.nominees.sort((x, y) => y.votes - x.votes || x.user_name.localeCompare(y.user_name));
            const total_votes = sorted.reduce((acc, r) => acc + r.votes, 0);
            return {
                award_id: a.award_id,
                award_category_name: a.award_category_name,
                total_votes,
                nominees: sorted
            };
        }).sort((x, y) => x.award_category_name.localeCompare(y.award_category_name));

        return res.status(200).json({
            event_edition_id: eventEditionId,
            ...(awardIdFilter ? { award_id_filter: awardIdFilter } : {}),
            awards
        });
    }
};