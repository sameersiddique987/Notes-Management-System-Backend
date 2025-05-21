import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: 'dod9yfzup',
  api_key: '666983146394437',
  api_secret: 'fGB7pFLKckZW88NqHOy_ogzn414'
});

const uploadImageToCloudinary = async (localPath) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localPath); 
    return result.secure_url;  
  } catch (error) {
    fs.unlinkSync(localPath);
    throw error;
  }
};

export default uploadImageToCloudinary;
