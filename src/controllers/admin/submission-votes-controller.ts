import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

export const submissionVotesController = {
    async totalsByEdition(req: Request, res: Response) {
        const eventEditionId = Number(req.params.id);
        if (!Number.isFinite(eventEditionId)) {
            return res.status(400).json({ error: "Invalid event edition id" });
        }
        const awardIdFilter = req.query.awardId ? Number(req.query.awardId) : undefined;
        if (req.query.awardId && !Number.isFinite(awardIdFilter)) {
            return res.status(400).json({ error: "Invalid awardId" });
        }

        const submissions = await prisma.submission.findMany({
            where: {
                award: {
                    event_edition_id: eventEditionId,
                    ...(awardIdFilter ? { id: awardIdFilter } : {})
                }
            },
            include: {
                award: { select: { id: true, category_name: true } },
                owner: { select: { id: true, user_name: true, user_email: true } },
                _count: { select: { votes: true } }
            },
            orderBy: [{ award_id: "asc" }, { id: "asc" }]
        });

        const byAward = new Map<number, {
            award_id: number;
            award_category_name: string;
            submissions: Array<{
                submission_id: number;
                project_title: string;
                owner_user_in_event_id: number;
                owner_name: string;
                owner_email: string;
                votes: number;
            }>;
        }>();

        for (const s of submissions) {
            if (!byAward.has(s.award.id)) {
                byAward.set(s.award.id, {
                    award_id: s.award.id,
                    award_category_name: s.award.category_name,
                    submissions: []
                });
            }
            byAward.get(s.award.id)!.submissions.push({
                submission_id: s.id,
                project_title: s.project_title,
                owner_user_in_event_id: s.owner.id,
                owner_name: s.owner.user_name,
                owner_email: s.owner.user_email,
                votes: s._count.votes
            });
        }

        const awards = [...byAward.values()].map(a => {
            const sorted = a.submissions.sort((x, y) => y.votes - x.votes || x.project_title.localeCompare(y.project_title));
            const total_votes = sorted.reduce((acc, r) => acc + r.votes, 0);
            return {
                award_id: a.award_id,
                award_category_name: a.award_category_name,
                total_votes,
                submissions: sorted
            };
        }).sort((x, y) => x.award_category_name.localeCompare(y.award_category_name));

        return res.status(200).json({
            event_edition_id: eventEditionId,
            ...(awardIdFilter ? { award_id_filter: awardIdFilter } : {}),
            awards
        });
    }
};