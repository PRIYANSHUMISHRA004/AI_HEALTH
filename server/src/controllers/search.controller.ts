import { Request, Response } from "express";

import { globalSearch } from "../services/search.service";
import { jsonSuccess } from "../utils/respond";

export const performGlobalSearch = async (req: Request, res: Response): Promise<void> => {
  const results = await globalSearch({
    query: req.query.query as string | undefined,
    limit: req.query.limit as string | undefined,
  });

  jsonSuccess(res, { data: results });
};
