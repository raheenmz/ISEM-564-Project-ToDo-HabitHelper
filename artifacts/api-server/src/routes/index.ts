import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tasksRouter from "./tasks";
import subtasksRouter from "./subtasks";
import classificationsRouter from "./classifications";
import dashboardRouter from "./dashboard";
import groupsRouter from "./groups";
import habitsRouter from "./habits";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tasksRouter);
router.use(subtasksRouter);
router.use(classificationsRouter);
router.use(dashboardRouter);
router.use(groupsRouter);
router.use(habitsRouter);

export default router;
