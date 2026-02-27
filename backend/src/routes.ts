import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController'; // <--- Importe aqui
import { isAuthenticated } from './middlewares/isAuthenticated'; // <--- Importe o porteiro
import { CreateCategoryController } from './controllers/category/CreateCategoryController';
import { CreateProductController } from './controllers/product/CreateProductController';
import { ListByCategoryController } from './controllers/product/ListByCategoryController';
import { CreateOrderController } from './controllers/order/CreateOrderController';
import { AddItemController } from './controllers/order/AddItemController';
import { DetailOrderController } from './controllers/order/DetailOrderController';
import { RemoveItemController } from './controllers/order/RemoveItemController';
import { SendOrderController } from './controllers/order/SendOrderController';
import { RemoveOrderController } from './controllers/order/RemoveOrderController';
import { ListCategoryController } from './controllers/category/ListCategoryController';

const router = Router();
const userController = new UserController();
const authController = new AuthController(); // <--- Instancie aqui


// -- ROTAS USUÁRIO --
router.post('/users', new UserController().handleCreate);
router.post('/session', new AuthController().handle);
router.get('/me', isAuthenticated, new UserController().detail);

// -- ROTAS CATEGORIA --
// Perceba o 'isAuthenticated': Só logado cria categoria!
router.post('/category', isAuthenticated, new CreateCategoryController().handle);

router.get('/category', isAuthenticated, new ListCategoryController().handle);

// -- ROTAS PRODUTOS --
router.post('/product', isAuthenticated, new CreateProductController().handle);

// GET /category/product?category_id=123
router.get('/category/product', isAuthenticated, new ListByCategoryController().handle);

// -- ROTAS ORDER (PEDIDOS) --
router.post('/order', isAuthenticated, new CreateOrderController().handle);

// -- ADICIONAR ITEM NA COMANDA --
router.post('/order/add', isAuthenticated, new AddItemController().handle);

// -- DETALHES DA COMANDA --
router.get('/order/detail', isAuthenticated, new DetailOrderController().handle);

// -- REMOVER ITEM --
router.delete('/order/remove', isAuthenticated, new RemoveItemController().handle);

// Rota para deletar a mesa inteira
router.delete('/order', isAuthenticated, new RemoveOrderController().handle);

// -- ENVIAR PEDIDO (MUDAR STATUS) --
router.put('/order/send', isAuthenticated, new SendOrderController().handle);

export { router };