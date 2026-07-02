import { Router } from "express";

import { approve, createRequest, listBorrowed, listIncoming, listOutgoing, reject, returnBorrowedEquipment } from "../controllers/equipment-request.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/async-handler";

const equipmentRequestRouter = Router();

equipmentRequestRouter.get("/incoming", authenticate, asyncHandler(listIncoming));
equipmentRequestRouter.get("/outgoing", authenticate, asyncHandler(listOutgoing));
equipmentRequestRouter.get("/borrowed", authenticate, asyncHandler(listBorrowed));

equipmentRequestRouter.post(
  "/",
  authenticate,
  authorizeRoles("hospital_admin"),
  asyncHandler(createRequest)
);

equipmentRequestRouter.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("hospital_admin"),
  asyncHandler(approve)
);

equipmentRequestRouter.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("hospital_admin"),
  asyncHandler(reject)
);

equipmentRequestRouter.patch(
  "/:id/return",
  authenticate,
  authorizeRoles("hospital_admin"),
  asyncHandler(returnBorrowedEquipment)
);

export default equipmentRequestRouter;
