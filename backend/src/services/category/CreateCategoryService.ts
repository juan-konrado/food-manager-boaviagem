import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryRequest {
  name: string;
}

class CreateCategoryService {
  async execute({ name }: CategoryRequest){
    
    // 1. Validação: Se não enviou nome, dá erro
    if(name === ''){
      throw new Error('Name invalid');
    }

    // 2. Criar no banco
    const category = await prisma.category.create({
      data: {
        name: name,
      },
      select: {
        id: true,
        name: true,
      }
    })

    return category;
  }
}

export { CreateCategoryService }