import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ListByCategoryService {
    async execute(category_id: string) {

        const findByCategory = await prisma.product.findMany({
            where: {
                categoryId: category_id
            }
        })

        return findByCategory;
    }
}
export { ListByCategoryService }