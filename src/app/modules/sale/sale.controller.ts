import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SaleService } from "./sale.service";
import { IAuthUser } from "./sale.interface";

interface IRequestWithUser extends Request {
  user?: IAuthUser;
}

const createSale = catchAsync(async (req: IRequestWithUser, res: Response) => {
  const decodedUser = req.user as IAuthUser;
  const result = await SaleService.createSale(decodedUser.userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Sale processed successfully",
    data: result,
  });
});

const getAllSales = catchAsync(async (req: Request, res: Response) => {
  const result = await SaleService.getAllSales();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sales history retrieved successfully",
    data: result,
  });
});

const getMySales = catchAsync(async (req: IRequestWithUser, res: Response) => {
  const decodedUser = req.user as IAuthUser;
  const result = await SaleService.getMySales(decodedUser.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My sales history retrieved successfully",
    data: result,
  });
});

const getSaleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SaleService.getSaleById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sale record retrieved successfully",
    data: result,
  });
});

export const SaleController = {
  createSale,
  getAllSales,
  getMySales,
  getSaleById,
};
