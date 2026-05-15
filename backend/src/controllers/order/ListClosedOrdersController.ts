import { Request, Response } from 'express';
import { ListClosedOrdersService } from '../../services/order/ListClosedOrdersService';

class ListClosedOrdersController {
    async handle(req: Request, res: Response) {

        const listClosedOrdersService = new ListClosedOrdersService();

        const orders = await listClosedOrdersService.execute();

        return res.json(orders);
    }
}

export { ListClosedOrdersController }