/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseServices from "../baseServices";
import Expense from "./expense.model";

class ExpenseService extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

   async getAll(userId: string) {
    return this.model.find({ user: userId });
  }

}

const expenseServices = new ExpenseService(Expense, "modelName");
export default expenseServices;