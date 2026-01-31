import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "loan_documents",
    resource_type: "auto", // images + PDFs
  },
});

const upload = multer({ storage });

// ✅ NAMED EXPORT
export { upload };

// (optional) default export if you ever need cloudinary directly
export default cloudinary;
