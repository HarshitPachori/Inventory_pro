import { Types } from 'mongoose';

export interface IProduct {
  user: Types.ObjectId;
  name: string;
  seller: Types.ObjectId;
  category: Types.ObjectId;
  brand?: Types.ObjectId;
  size?: string;
  price: number;
  sellPrice: number;
  stock: number;
  description: string;
}
