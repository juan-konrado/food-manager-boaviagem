import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


interface ProductRequest {
    product_id: string;
    name: string;
    price: string;
    description: string;
    banner?: string;
}

class UpdateProductService {
    async execute({ product_id, name, price, description, banner }: ProductRequest) {

        // Convertendo o preço de String para Float (Número com vírgula/ponto)
        const dataToUpdate: any = {
            name: name,
            price: parseFloat(price), // <--- O segredo da conversão está aqui!
            description: description
        };

        // Se a pessoa mandou uma foto nova, a gente coloca no pacote
        if (banner) {
            dataToUpdate.banner = banner;
        }

        const product = await prisma.product.update({
            where: {
                id: product_id
            },
            data: dataToUpdate
        });

        return product;
    }
}

export { UpdateProductService }