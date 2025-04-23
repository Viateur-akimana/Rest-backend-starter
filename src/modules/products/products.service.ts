import prisma from "@config/database";
import { ProductInput } from "./products.validator";


export const createProduct = async (userId: number, input: ProductInput) => {
    return await prisma.product.create({
        data: {
            ...input,
            userId
        }
    });
}

export const getProducts = async (userId: number) => {
    return await prisma.product.findMany({
        where: {
            userId
        }
    });
}
export const getProductById = async (userId: number, productId: number) => {
    return await prisma.product.findFirst({
        where: {
            id: productId,
            userId
        }
    });
}
export const updateProduct = async (userId: number, productId: number, input: ProductInput) => {
    return await prisma.product.update({
        where: {
            id: productId,
            userId
        },
        data: {
            ...input
        }
    });
}
export const deleteProduct = async (userId: number, productId: number) => {
    return await prisma.product.delete({
        where: {
            id: productId,
            userId
        }
    });
}