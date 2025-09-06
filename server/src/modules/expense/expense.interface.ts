import { Types } from "mongoose";

export interface IExpense {
  user: Types.ObjectId;
  title: string;
  amount: number;
  description?: string;
}