const cloudinary = require('cloudinary')
const CloudinaryStorage = require('multer-storage-cloudinary');

if(!process.env.CLOUDINARY_SECRET) {
    console.error("ERROR: Cloudinary credentials not found in process.env!")
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'AAAStore', // Your custom folder name
        allowedFormats: ['jpeg', 'png', 'jpg'],
        // In 2026, we don't need 'transformation' here unless 
        // you want to auto-resize product photos.
    }
});

module.exports = {
    cloudinary,
    storage
};

