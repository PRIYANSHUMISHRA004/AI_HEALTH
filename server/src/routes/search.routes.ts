import { Router } from "express";

import { performGlobalSearch } from "../controllers/search.controller";
import { asyncHandler } from "../utils/async-handler";

const searchRouter = Router();

searchRouter.get("/global", asyncHandler(performGlobalSearch));

export default searchRouter;
