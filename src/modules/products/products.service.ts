import { NotFoundException } from "../../exceptions/NotFoundException";
import prisma from "../../config/database";
import { ProductInput } from "./products.validator";

export const createProduct = async (userId: number, input: any, image?: string) => {
    return await prisma.product.create({
        data: {
            ...input,
            image,
            userId,
        },
    });
};

export const getProducts = async (
    userId: number,
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) => {
    const skip = (page - 1) * limit;

    const where = {
        userId,
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
    };

    const orderBy = sortBy
        ? {
            [sortBy]: sortOrder || "asc",
        }
        : undefined;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy,
        }),
        prisma.product.count({ where }),
    ]);

    return {
        data: products,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    };
};

export const getProductById = async (userId: number, productId: number) => {
    const singleProduct = await prisma.product.findFirst({
        where: {
            id: productId,
            userId,
        },
    });
    if (!singleProduct) {
        throw new NotFoundException("Product not found with such id and user");
    }
    return singleProduct;
};

export const updateProduct = async (userId: number, productId: number, input: ProductInput, image?: string) => {
    const updateData: any = { ...input };

    if (image) {
        updateData.image = image;
    }
    return await prisma.product.update({
        where: {
            id: productId,
            userId,
        },
        data: updateData,
    });
};

export const deleteProduct = async (userId: number, productId: number) => {
    return await prisma.product.delete({
        where: {
            id: productId,
            userId,
        },
    });
};