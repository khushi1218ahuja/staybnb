import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import roomsRouter from "./rooms";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";
import statsRouter from "./stats";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(roomsRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(adminRouter);
router.use(statsRouter);
router.use(seedRouter);

export default router;
