import { Router } from "express";
import healthCheckRoutes from "./public/health-check-routes";
import projectSubmissionRoutes from "./public/submissions-routes";
import readyRoutes from "./public/ready-routes";
import docsRoutes from "./public/docs-routes";
import authRoutes from "./public/auth-routes";
import rolesAdminRoutes from "./admin/roles-routes";
import usersAdminRoutes from "./admin/users-routes";
import eventEditionsAdminRoutes from "./admin/event-editions-routes";
import adminAwardsRoutes from "./admin/awards-routes";
import publicNominationsRoutes from "./public/nominations-routes";
import adminSubmissionsRoutes from "./admin/submissions-routes";
import csrfRoutes from "./public/csrf-routes";
import publicHealthRoutes from "./public/health-routes";
import votesRoutes from "./public/nominee-votes-routes";
import adminVotesRoutes from "./admin/votes-routes";
import publicSubmissionVotesRoutes from "./public/submissions-votes-routes";
import adminSubmissionVotesRoutes from "./admin/submission-votes-routes";
import publicEditionRoutes from "./public/edition-routes";
import publicAwardsRoutes from "./public/awards-routes";
import publicUsersInEventRoutes from "./public/users-in-event-routes";
import { requireAdmin } from "../middlewares/auth-jwt";
import { requireCsrf } from "../middlewares/require-csrf";

const router = Router();

router.get("/", (_req, res) => {
    res.status(200).json({
        message: "ignite-backend API running",
        routes: [
            "/healthz",
            "/readyz",
            "/public/csrf-token",
            "/public/submit",
            "/public/event-editions/:id/nomination-candidates",
            "/public/nominations:bulk",
            "/public/votes:bulk",
            "/public/submission-votes:bulk",
            "/public/edition/current",
            "/docs",
            "/openapi.json",
            "/auth/login",
            "/admin/roles",
            "/admin/users",
            "/admin/event-editions",
            "/admin/awards",
        ],
    });
});

router.use("/healthz", healthCheckRoutes);
router.use("/readyz", readyRoutes);
router.use("/public", csrfRoutes);
router.use("/public/health", publicHealthRoutes);

router.use("/public", requireCsrf, projectSubmissionRoutes);
router.use("/public", requireCsrf, publicNominationsRoutes);
router.use("/public", requireCsrf, votesRoutes);
router.use("/public", requireCsrf, publicSubmissionVotesRoutes);
router.use("/public", requireCsrf, publicEditionRoutes);
router.use("/public", requireCsrf, publicAwardsRoutes);
router.use("/public", requireCsrf, publicUsersInEventRoutes);

router.use("/", docsRoutes);
router.use("/auth", authRoutes);

router.use("/admin/roles", requireAdmin, rolesAdminRoutes);
router.use("/admin/users", requireAdmin, usersAdminRoutes);
router.use("/admin/event-editions", requireAdmin, eventEditionsAdminRoutes);
router.use("/admin/awards", requireAdmin, adminAwardsRoutes);
router.use("/admin/submissions", requireAdmin, adminSubmissionsRoutes);
router.use("/admin/votes", requireAdmin, adminVotesRoutes);
router.use("/admin/votes", requireAdmin, adminSubmissionVotesRoutes);

export default router;