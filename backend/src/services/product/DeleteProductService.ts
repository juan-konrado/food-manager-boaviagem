import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class DeleteProductService {
    async execute({ product_id }: { product_id: string }) {
        const product = await prisma.product.delete({
            where: {
                id: product_id
            }
        });
        return product;
    }
}
export { DeleteProductService }