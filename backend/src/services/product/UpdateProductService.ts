import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface ProductRequest {
    product_id: string;
    name: string;
    price: string;
    cost_price?: string; // 🟢 NOVO: Recebendo o custo
    description: string;
    banner?: string;
}

class UpdateProductService {
    async execute({ product_id, name, price, cost_price, description, banner }: ProductRequest) {

        // Convertendo os preços de String para Float (Número com vírgula/ponto)
        const dataToUpdate: any = {
            name: name,
            price: parseFloat(price), 
            
            // 🟢 NOVO: Convertendo e atualizando o custo
            cost_price: cost_price ? parseFloat(cost_price) : 0, 
            
            description: description
        };

        // Se a pessoa mandou uma foto nova, a gente coloca no pacote
        if (banner) {
            dataToUpdate.imageUrl = banner; // 🟢 Ajustado para bater com a sua coluna no banco
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