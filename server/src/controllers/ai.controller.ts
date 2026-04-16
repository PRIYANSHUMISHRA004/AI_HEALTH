import { Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { HttpError } from "../utils/http-error";
import {
  chat,
  generateHospitalInsights,
  runEmergencyMode,
  smartSearchQuery,
  summarizeReviews,
} from "../services/ai.service";
import { jsonSuccess } from "../utils/respond";

export const summarizeReviewsHandler = async (req: Request, res: Response): Promise<void> => {
  const reviewTexts = req.body.reviewTexts as string[] | undefined;
  const summary = await summarizeReviews(reviewTexts ?? []);

  jsonSuccess(res, { data: { summary } });
};

export const chatHandler = async (req: Request, res: Response): Promise<void> => {
  const message = String(req.body.message ?? "").trim();
  if (!message) {
    throw new HttpError(400, "message is required");
  }

  const prompt =
    typeof req.body.context === "string" && req.body.context.trim()
      ? `Context:\n${req.body.context.trim()}\n\nUser message:\n${message}`
      : message;

  const responseText = await chat(prompt);

  jsonSuccess(res, { data: { reply: responseText } });
};

export const smartSearchQueryHandler = async (req: Request, res: Response): Promise<void> => {
  const result = await smartSearchQuery(req.body.query);

  jsonSuccess(res, { data: result });
};

export const emergencyHandler = async (req: Request, res: Response): Promise<void> => {
  const result = await runEmergencyMode({
    problemDescription: req.body.problemDescription,
    location: req.body.location,
  });

  jsonSuccess(res, { data: result });
};

export const insightsHandler = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const result = await generateHospitalInsights({
    userId: authReq.user.userId,
    hospitalId: req.query.hospitalId as string | undefined,
  });

  jsonSuccess(res, { data: result });
};

