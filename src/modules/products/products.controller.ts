import { Request, Response } from 'express';
import { productSchema } from './products.validator';
import * as productservice from './products.service';
import { BadRequestException } from '../../exceptions/BadRequestException';
import logger from '../../config/logger';


interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        [key: string]: any;
    };


}

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const validator = productSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }
        const authReq = req as AuthenticatedRequest;
        const image = req.file?.filename;
        if (!image) {
            throw new BadRequestException('Image is required');
        }
        const product = await productservice.createProduct(authReq.user.userId, validator.data, image);
        logger.info(`Product created: ${product.name}`);
        res.status(201).json(product);
    } catch (error) {
        logger.error(`Error during product creation: ${error}`);
        throw error;

    }

};

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products for the authenticated user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;

        const products = await productservice.getProducts(
            authReq.user.userId,
            parseInt(page as string),
            parseInt(limit as string),
            search as string,
            sortBy as string,
            sortOrder as "asc" | "desc"
        );

        logger.info(`Fetched products for user: ${authReq.user.userId}`);
        res.json(products);
    } catch (error) {
        logger.error(`Error fetching products: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new BadRequestException('Invalid product id');
        }
        const authReq = req as AuthenticatedRequest;
        const singleProduct = await productservice.getProductById(authReq.user.userId, id);
        logger.info(`Fetched product by ID: ${id}`);
        res.json(singleProduct);
    } catch (error) {
        logger.error(`Error fetching product by ID: ${error}`);
        throw error;

    }

};
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Description of the product
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the product
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the product
 *     responses:
 *       200:
 *         description: Updated product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new BadRequestException('Invalid product id');
        }
        const validator = productSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }

        const authReq = req as AuthenticatedRequest;
        const image = req.file?.filename;

        const updatedProduct = await productservice.updateProduct(
            authReq.user.userId,
            id,
            validator.data,
            image
        );

        logger.info(`Product updated: ${updatedProduct.name}`);
        res.json(updatedProduct);
    } catch (error) {
        logger.error(`Error updating product: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new BadRequestException('Invalid product id');
        }
        const authReq = req as AuthenticatedRequest;
        await productservice.deleteProduct(authReq.user.userId, id);
        logger.info(`Product deleted: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting product: ${error}`);
        throw error;

    }

};