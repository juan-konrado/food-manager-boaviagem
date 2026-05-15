import { Request, Response } from 'express';
import { UpdateProductService } from '../../services/product/UpdateProductService';

class UpdateProductController {
    async handle(req: Request, res: Response) {
        
        // 🟢 1. O SEGREDO ESTÁ AQUI: Temos que tirar o cost_price de dentro do req.body
        const { product_id, name, price, cost_price, description } = req.body;

        const updateProductService = new UpdateProductService();

        // Verifica se o usuário enviou uma imagem nova
        let banner = undefined;
        if (req.file) {
            banner = req.file.filename;
        }

        const product = await updateProductService.execute({
            product_id,
            name,
            price,
            cost_price, // 🟢 2. E ENTREGAR ELE AQUI PARA O SERVICE!
            description,
            banner
        });

        return res.json(product);
    }
}

export { UpdateProductController };