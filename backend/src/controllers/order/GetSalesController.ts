import { Request, Response } from 'express';
import { GetSalesService } from '../../services/order/GetSalesService';

class GetSalesController {
    async handle(req: Request, res: Response) {
        const getSalesService = new GetSalesService();

        const sales = await getSalesService.execute();

        return res.json(sales);
    }
}

export { GetSalesController }