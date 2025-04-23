import { Request, Response } from 'express';
import { productSchema } from './products.validator';
import * as productservice from "./products.service"
import { BadRequestException } from '@/exceptions/BadRequestException';

export const createProduct = async (req: Request, res: Response) => {
    const validator = productSchema.safeParse(req.body)
    if (!validator.success) {
        throw new BadRequestException("Validation error", validator.error.errors)
    }
    const product = await productservice.createProduct(req.user.userId, validator.data)
    res.status(201).json(product)
}

export const getAllProducts = async (req: Request, res: Response) => {
    const products = await productservice.getProducts(req.user.userId)
    res.json(products)
}
export const getProductById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestException("Invalid product id")
    }
    const singleProduct = await productservice.getProductById(req.user.userId, id)
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
    const updatedProduct = await productservice.updateProduct(req.user.userId, id, validator.data)
    res.json(updatedProduct)
}

export const deleteProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestException("Invalid product id")
    }
    await productservice.deleteProduct(req.user.userId, id)
    res.status(204).send()
}