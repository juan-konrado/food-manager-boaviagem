import { Request, Response } from 'express';
import { UpdateProductService } from '../../services/product/UpdateProductService';

class UpdateProductController {
    async handle(req: Request, res: Response) {
        const { product_id, name, price, description } = req.body;

        const updateProductService = new UpdateProductService();

        // Verifica se veio um arquivo novo de foto
        if (!req.file) {
            const product = await updateProductService.execute({
                product_id,
                name,
                price,
                description
            });
            return res.json(product);
        } else {
            const { filename: banner } = req.file;
            const product = await updateProductService.execute({
                product_id,
                name,
                price,
                description,
                banner
            });
            return res.json(product);
        }
    }
}

export { UpdateProductController }