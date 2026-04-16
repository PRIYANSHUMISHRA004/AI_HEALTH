import { Router } from "express";

import {
  chatHandler,
  emergencyHandler,
  insightsHandler,
  smartSearchQueryHandler,
  summarizeReviewsHandler,
} from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/async-handler";

const aiRouter = Router();

aiRouter.post("/summarize-reviews", asyncHandler(summarizeReviewsHandler));
aiRouter.post("/chat", asyncHandler(chatHandler));
aiRouter.post("/smart-search-query", asyncHandler(smartSearchQueryHandler));
aiRouter.post("/emergency", asyncHandler(emergencyHandler));
aiRouter.get(
  "/insights",
  authenticate,
  authorizeRoles("hospital_admin", "doctor"),
  asyncHandler(insightsHandler),
);

export default aiRouter;

