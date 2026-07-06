import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
    cloudinary.config({
        cloud_name: config.cloudinary.cloud_name,
        api_key: config.cloudinary.api_key,
        api_secret: config.cloudinary.api_secret,
    });

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: "mini-erp-products",
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
};

export const fileUpload = {
    upload,
    uploadToCloudinary,
};