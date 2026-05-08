import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProductRequest {
  name: string;
  price: string;
  cost_price?: string; 
  description: string;
  banner: string;
  category_id: string;
}

class CreateProductService {
  async execute({ name, price, cost_price, description, banner, category_id }: ProductRequest) {
    
    const product = await prisma.product.create({
      data: {
        name: name,
        price: parseFloat(price), 
        // @ts-ignore
        cost_price: cost_price ? parseFloat(cost_price) : 0, 
        description: description,
        imageUrl: banner,        
        categoryId: category_id, 
      }
    });

    return product;
  }
}

export { CreateProductService };