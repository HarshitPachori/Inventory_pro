import { model, Schema } from "mongoose";
import { IExpense } from "./expense.interface";

const expenseSchema = new Schema<IExpense>(
  {
  user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String }
  },{
    timestamps: true
  }
)

const Expense = model<IExpense>('expense', expenseSchema);
export default Expense;