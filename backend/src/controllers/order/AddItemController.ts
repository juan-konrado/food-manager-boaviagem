import { Request, Response } from 'express';
import { AddItemService } from '../../services/order/AddItemService';

// 🟢 IMPORTAMOS O MEGAFONE
import { io } from '../../server';

class AddItemController {
    async handle(req: Request, res: Response) {
        // 🟢 Pegamos TANTO o quantity (Web) QUANTO o amount (Mobile)
        const { order_id, product_id, quantity, amount } = req.body;

        const addItem = new AddItemService();

        const order = await addItem.execute({
            order_id,
            product_id,
            // 🟢 A MÁGICA BILÍNGUE: Se tiver quantity usa ele, senão usa o amount!
            quantity: quantity || amount
        });

        // 🟢 O GRITO: "Ei Caixa, o garçom acabou de adicionar uma cerveja!"
        io.emit('orders_updated');

        return res.json(order);
    }
}

export { AddItemController };