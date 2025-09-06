import { Router } from 'express';
import brandRoutes from '../modules/brand/brand.routes';
import categoryRoutes from '../modules/category/category.routes';
import expenseRoutes from '../modules/expense/expense.routes';
import productRoute from '../modules/product/product.routes';
import purchaseRoutes from '../modules/purchase/purchase.routes';
import saleRoutes from '../modules/sale/sale.routes';
import sellerRoutes from '../modules/seller/seller.routes';
import userRoutes from '../modules/user/user.routes';

const rootRouter = Router();

rootRouter.use('/users', userRoutes);
rootRouter.use('/products', productRoute);
rootRouter.use('/sales', saleRoutes);
rootRouter.use('/categories', categoryRoutes);
rootRouter.use('/brands', brandRoutes);
rootRouter.use('/sellers', sellerRoutes);
rootRouter.use('/purchases', purchaseRoutes);
rootRouter.use("/expenses",expenseRoutes)

export default rootRouter;
