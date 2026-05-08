import { Request, Response } from 'express';
import { CreateOrderService } from '../../services/order/CreateOrderService';
import { io } from '../../server';

class CreateOrderController {
  async handle(req: Request, res: Response) {
    const { table, name } = req.body;

    const createOrderService = new CreateOrderService();

    const order = await createOrderService.execute({
      table,
      name
    });

    io.emit('orders_updated');
    io.emit('new_order_created', order); // Manda os dados da mesa no grito!
    return res.json(order);
  }
}

export { CreateOrderController }