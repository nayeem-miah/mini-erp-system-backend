import { Request, Response } from "express";
import ApiError from "../../errors/apiError";
import catchAsync from "../../utils/catchAsync";
import { fileUpload } from "../../utils/fileUpload";
import sendResponse from "../../utils/sendResponse";
import { ProductService } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "Product Image is required");
  }

  const uploadResult = await fileUpload.uploadToCloudinary(file);
  if (!uploadResult || !uploadResult.secure_url) {
    throw new ApiError(500, "Image upload failed");
  }

  const productData = {
    ...req.body,
    image: uploadResult.secure_url,
  };

  const result = await ProductService.createProduct(productData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getProductById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;
  let updateData = { ...req.body };

  if (file) {
    const uploadResult = await fileUpload.uploadToCloudinary(file);
    if (!uploadResult || !uploadResult.secure_url) {
      throw new ApiError(500, "Image upload failed");
    }
    updateData.image = uploadResult.secure_url;
  }

  const result = await ProductService.updateProduct(id, updateData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteProduct(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
