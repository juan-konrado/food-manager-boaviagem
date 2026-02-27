import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


class ListCategoryService {
    async execute() {
        // Puxa todas as categorias do banco
        const category = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
            }
        });

        return category;
    }
}

export { ListCategoryService }