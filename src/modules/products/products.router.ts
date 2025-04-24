import { Router } from 'express';
import * as productController from './products.controller';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

router.post("/", upload.single('image'), productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;