const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

function checkFileType(mimeType, allowedTypes) {
  return allowedTypes.some(t => mimeType.startsWith(t));
}

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (checkFileType(file.mimetype, ['image/', 'video/'])) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images and videos'), false);
    }
  },
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (checkFileType(file.mimetype, ['image/'])) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  },
});

const coverUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (checkFileType(file.mimetype, ['image/'])) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  },
});

async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'joeailabs',
        resource_type: options.resourceType || 'auto',
        transformation: options.transformation || [],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

async function uploadImage(buffer, folder = 'joeailabs') {
  return uploadToCloudinary(buffer, {
    folder,
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  });
}

async function uploadAvatar(buffer) {
  return uploadToCloudinary(buffer, {
    folder: 'joeailabs/avatars',
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
  });
}

async function uploadCover(buffer) {
  return uploadToCloudinary(buffer, {
    folder: 'joeailabs/covers',
    transformation: [{ width: 1600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
  });
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
}

module.exports = { cloudinary, upload, avatarUpload, coverUpload, uploadImage, uploadAvatar, uploadCover, deleteFromCloudinary };
