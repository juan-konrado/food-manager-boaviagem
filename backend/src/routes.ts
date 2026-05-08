import multer from 'multer';
import uploadConfig from './config/multer';
import { Router } from 'express';

// Middlewares
import { isAuthenticated } from './middlewares/isAuthenticated';
import { isAdmin } from './middlewares/isAdmin';

// Controllers
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { CreateCategoryController } from './controllers/category/CreateCategoryController';
import { ListCategoryController } from './controllers/category/ListCategoryController';
import { DeleteCategoryController } from './controllers/category/DeleteCategoryController';
import { CreateProductController } from './controllers/product/CreateProductController';
import { ListByCategoryController } from './controllers/product/ListByCategoryController';
import { UpdateProductController } from './controllers/product/UpdateProductController';
import { DeleteProductController } from './controllers/product/DeleteProductController';
import { CreateOrderController } from './controllers/order/CreateOrderController';
import { AddItemController } from './controllers/order/AddItemController';
import { DetailOrderController } from './controllers/order/DetailOrderController';
import { RemoveItemController } from './controllers/order/RemoveItemController';
import { SendOrderController } from './controllers/order/SendOrderController';
import { RemoveOrderController } from './controllers/order/RemoveOrderController';
import { ListOrdersController } from './controllers/order/ListOrdersController';
import { FinishOrderController } from './controllers/order/FinishOrderController';
import { GetSalesController } from './controllers/order/GetSalesController';

const router = Router();
const upload = multer(uploadConfig.upload("./tmp"));

// ==========================================
// -- ROTAS USUÁRIO E LOGIN --
// ==========================================
router.post('/users', new UserController().handleCreate);
router.post('/session', new AuthController().handle);
router.get('/me', isAuthenticated, new UserController().detail);

// ==========================================
// -- ROTAS FINANCEIRAS (Dashboard) --
// ==========================================
// 🟢 SÓ ADMIN: Ver faturamento
router.get('/sales', isAuthenticated, isAdmin, new GetSalesController().handle);

// ==========================================
// -- ROTAS DE CATEGORIA --
// ==========================================
// 🟢 SÓ ADMIN: Criar e Deletar categoria
router.post('/category', isAuthenticated, isAdmin, new CreateCategoryController().handle);
router.delete('/category', isAuthenticated, isAdmin, new DeleteCategoryController().handle);

// Garçom pode listar para ver no cardápio
router.get('/category', isAuthenticated, new ListCategoryController().handle);

// ==========================================
// -- ROTAS DE PRODUTOS --
// ==========================================
// 🟢 SÓ ADMIN: Criar, Editar e Deletar produtos
router.post('/product', isAuthenticated, isAdmin, upload.single('file'), new CreateProductController().handle);
router.put('/product', isAuthenticated, isAdmin, upload.single('file'), new UpdateProductController().handle);
router.delete('/product', isAuthenticated, isAdmin, new DeleteProductController().handle);

// Garçom pode listar produtos da categoria
router.get('/category/product', isAuthenticated, new ListByCategoryController().handle);

// ==========================================
// -- ROTAS DE COMANDAS (Garçons e Admins) --
// ==========================================
router.post('/order', isAuthenticated, new CreateOrderController().handle);
router.get('/orders', isAuthenticated, new ListOrdersController().handle);
router.post('/order/add', isAuthenticated, new AddItemController().handle);
router.get('/order/detail', isAuthenticated, new DetailOrderController().handle);
router.delete('/order/remove', isAuthenticated, new RemoveItemController().handle);
router.delete('/order', isAuthenticated, new RemoveOrderController().handle);
router.put('/order/send', isAuthenticated, new SendOrderController().handle);
router.put('/order/finish', isAuthenticated, new FinishOrderController().handle);

export { router };