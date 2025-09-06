/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import CustomError from '../../errors/customError';
import sortAndPaginatePipeline from '../../lib/sortAndPaginate.pipeline';
import BaseServices from '../baseServices';
import Product from '../product/product.model';
import matchStagePipeline from './sale.aggregation.pipeline';
import Sale from './sale.model';

class SaleServices extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

  /**
   * Create new sale and decrease product stock
   */
  async create(payload: any, userId: string) {
    const { sellPrice, quantity } = payload;
    payload.user = userId;
    payload.totalPrice = sellPrice * quantity;
    const product = await Product.findById(payload.product);

    if (quantity > product!.stock) {
      throw new CustomError(400, `${quantity} product are not available in stock!`);
    }
    let result: any[];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await Product.findByIdAndUpdate(product?._id, { $inc: { stock: -quantity } }, { session });
      result = await this.model.create([payload], { session });
      await session.commitTransaction();

      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new CustomError(400, 'Sale create failed');
    } finally {
      await session.endSession();
    }
  }

  /**
   *  Get all sale
   */
  async readAll(query: Record<string, unknown> = {}, userId: string) {
    // const date = query.date ? query.date : null;
    // const search = query.search ? (query.search as string) : '';

    const data = await this.model.aggregate([
      ...matchStagePipeline(query,userId),
      ...sortAndPaginatePipeline(query)
    ]);

    const totalCount = await this.model.aggregate([
      ...matchStagePipeline(query,userId),
      {
        $group: {
          _id: null,
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          total:1
        }
      }
    ]);

    return { data, totalCount:totalCount[0]?.total || 0 };
  }

  async readAllWeeks(userId: string) {
    return await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: '$date' },
            year: { $isoWeekYear: '$date' }
          },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.week': 1
        }
      },
      {
        $project: {
          week: '$_id.week',
          year: '$_id.year',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);
  }

  async readAllYearly(userId: string) {
    return await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' }
          },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: {
          '_id.year': 1
        }
      },
      {
        $project: {
          year: '$_id.year',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);
  }

  async readAllDaily(userId: string) {
    return await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      },
      {
        $project: {
          day: '$_id.day',
          month: '$_id.month',
          year: '$_id.year',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);
  }

  async readAllMonths(userId: string) {
    return await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);
  }

  // get single sale
  async read(id: string, userId: string) {
    await this._isExists(id);

    return this.model.findOne({ user: new Types.ObjectId(userId), _id: id }).populate({
      path: 'product',
      select: '-createdAt -updatedAt -__v'
    });
  }

  /**
   * Update sale (amountPaid and dueDate)
   */
  async update(id: string, payload: { amountPaid?: number; dueDate?: string | null , userId: string}) {
    await this._isExists(id);

    const sale = await this.model.findOne({ _id: id, user: new Types.ObjectId(payload?.userId) });
    if (!sale) {
      throw new CustomError(404, 'Sale not found');
    }

    const update: any = {};
    if (payload.amountPaid !== undefined) {
      const currentPaid = sale.amountPaid || 0;
      const newAmountPaid = currentPaid + payload.amountPaid;
      console.log({newAmountPaid,currentPaid,payload});
      
      if(newAmountPaid > sale.totalPrice){
        throw new CustomError(400, 'Amount paid exceeds total price');
      }
      update.amountPaid = newAmountPaid;
      // If amountPaid equals or exceeds totalPrice, set dueDate to null
      if (update.amountPaid == sale.totalPrice) {
        update.dueDate = new Date(0);
      } else if (payload.dueDate !== undefined) {
        update.dueDate = payload.dueDate ? new Date(payload.dueDate) : new Date(0);
      }
    } else if (payload.dueDate !== undefined) {
      update.dueDate = payload.dueDate ? new Date(payload.dueDate) : new Date(0);
    }

    const result = await this.model.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!result) {
      throw new CustomError(400, 'Failed to update sale');
    }

    return result;
  }

}

const saleServices = new SaleServices(Sale, 'modelName');
export default saleServices;
