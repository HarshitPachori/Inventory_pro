import { Types } from "mongoose";

const matchStagePipeline = (query: Record<string, unknown>, userId: string) => {
  const match: any = {
    user: new Types.ObjectId(userId),
  };

  if (query.search) {
    match.$or = [
      { productName: { $regex: new RegExp(query.search as string, 'i') } },
      { buyerName: { $regex: new RegExp(query.search as string, 'i') } }
    ];
  }

  if (query.filter === 'amountRemaining') {
    match.$expr = {
      $gt: [
        { $subtract: [ "$totalPrice", { $ifNull: [ "$amountPaid", 0 ] } ] },
        0
      ]
    };
  } else if (query.filter === 'dueDatePassed') {
    match.dueDate = { $lt: new Date() ,$ne: new Date(0)};
  }

  return [
    {
      $match: match
    },{
      $addFields: {
        amountRemaining: { $subtract: [
          { $ifNull: [ "$totalPrice", 0 ] }, 
          { $ifNull: [ "$amountPaid", 0]},
        ] }
      }
    }
  ];
};

export default matchStagePipeline;