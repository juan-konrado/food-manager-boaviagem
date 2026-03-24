import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


class DeleteCategoryService {
    async execute({ category_id }: { category_id: string }) {
        const category = await prisma.category.delete({
            where: {
                id: category_id
            }
        });
        return category;
    }
}
export { DeleteCategoryService }