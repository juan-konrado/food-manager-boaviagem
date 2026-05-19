import { Request, Response } from 'express';
import { CreateOrderService } from '../../services/order/CreateOrderService';
import { io } from '../../server';

class CreateOrderController {
  async handle(req: Request, res: Response) {
    const { table, name } = req.body;

    // 🟢 A MÁGICA AQUI: Pega o ID secreto extraído do Token de Login!
    const user_id = req.user_id;

    const createOrderService = new CreateOrderService();

    const order = await createOrderService.execute({
      table,
      name,
      waiterId: user_id // 🟢 Envia o ID para o Service carimbar a comanda
    });

    io.emit('orders_updated');
    io.emit('new_order_created', order); // Manda os dados da mesa no grito!
    return res.json(order);
  }
}

export { CreateOrderController }