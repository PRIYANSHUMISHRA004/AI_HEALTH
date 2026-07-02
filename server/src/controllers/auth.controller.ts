import { Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getCurrentUserById, loginUser, registerUser, updateUserProfile } from "../services/auth.service";
import { jsonSuccess } from "../utils/respond";

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await registerUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    role: req.body.role,
    linkedHospitalId: req.body.linkedHospitalId,
    hospitalName: req.body.hospitalName,
  });

  jsonSuccess(res, { message: "User registered successfully", data: result }, 201);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await loginUser({
    email: req.body.email,
    password: req.body.password,
  });

  jsonSuccess(res, { message: "Login successful", data: result });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const user = await getCurrentUserById(authReq.user.userId);

  jsonSuccess(res, { message: "Current user fetched successfully", data: user });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const updated = await updateUserProfile(authReq.user.userId, {
    name: req.body.name,
    phone: req.body.phone,
    linkedHospitalId: req.body.linkedHospitalId,
  });

  jsonSuccess(res, { message: "Profile updated successfully", data: updated });
};
