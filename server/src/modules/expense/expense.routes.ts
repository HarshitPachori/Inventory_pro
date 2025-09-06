import { Router } from "express";
import verifyAuth from "../../middlewares/verifyAuth";
import expenseController from "./expense.controllers";

const expenseRoutes = Router()

expenseRoutes.use(verifyAuth)

expenseRoutes.post("/",expenseController.create)
expenseRoutes.get("/",expenseController.getAll)
expenseRoutes.delete("/:id",expenseController.delete)
expenseRoutes.patch("/:id",expenseController.update)

export default expenseRoutes