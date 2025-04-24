import multer from 'multer';
import path from 'path';

// Configure storage for uploaded file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});


// Configure multer
export const upload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // 1 MB file size limit
    },
});