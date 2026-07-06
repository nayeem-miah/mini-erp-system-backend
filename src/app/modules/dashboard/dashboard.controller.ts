import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const getDashboardInsights = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardInsights();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard insights retrieved successfully",
    data: result,
  });
});

export const DashboardController = {
  getDashboardInsights,
};
