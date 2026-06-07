import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tasksRouter from "./tasks";
import classificationsRouter from "./classifications";
import dashboardRouter from "./dashboard";
import groupsRouter from "./groups";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tasksRouter);
router.use(classificationsRouter);
router.use(dashboardRouter);
router.use(groupsRouter);

export default router;
