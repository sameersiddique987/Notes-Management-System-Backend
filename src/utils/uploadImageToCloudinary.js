// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';

// cloudinary.config({
//   cloud_name: 'dod9yfzup',
//   api_key: '666983146394437',
//   api_secret: 'fGB7pFLKckZW88NqHOy_ogzn414'
// });

// const uploadImageToCloudinary = async (localPath) => {
//   try {
//     const result = await cloudinary.uploader.upload(localPath, {
//       resource_type: "auto",
//     });
//     fs.unlinkSync(localPath); 
//     return result.secure_url;  
//   } catch (error) {
//     fs.unlinkSync(localPath);
//     throw error;
//   }
// };

// export default uploadImageToCloudinary;








import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: 'dod9yfzup',
  api_key: '666983146394437',
  api_secret: 'fGB7pFLKckZW88NqHOy_ogzn414'
});

const uploadImageToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export default uploadImageToCloudinary;
