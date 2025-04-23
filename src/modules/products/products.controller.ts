import { Request, Response } from 'express';
import { productSchema } from './products.validator';
import * as productservice from "./products.service"
import { BadRequestException } from '../../exceptions/BadRequestException';
interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        [key: string]: any;
    };
}

export const createProduct = async (req: Request, res: Response) => {
    const validator = productSchema.safeParse(req.body)
    if (!validator.success) {
        throw new BadRequestException("Validation error", validator.error.errors)
    }
    const authReq = req as AuthenticatedRequest;
    const product = await productservice.createProduct(authReq.user.userId, validator.data)
    res.status(201).json(product)
}

export const getAllProducts = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const products = await productservice.getProducts(authReq.user.userId)
    res.json(products)
}
export const getProductById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestException("Invalid product id")
    }
    const authReq = req as AuthenticatedRequest;
    const singleProduct = await productservice.getProductById(authReq.user.userId, id)
    res.json(singleProduct)
}

export const updateProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestException("Invalid product id")
    }
    const validator = productSchema.safeParse(req.body)
    if (!validator.success) {
        throw new BadRequestException("Validation error", validator.error.errors)
    }
    const authReq = req as AuthenticatedRequest;
    const updatedProduct = await productservice.updateProduct(authReq.user.userId, id, validator.data)
    res.json(updatedProduct)
}

export const deleteProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestException("Invalid product id")
    }
    const authReq = req as AuthenticatedRequest;
    await productservice.deleteProduct(authReq.user.userId, id)
    res.status(204).send()
}