import httpStatus from "http-status";
import asyncHandler from "../../lib/asyncHandler";
import sendResponse from "../../lib/sendResponse";
import expenseServices from "./expense.services";

class ExpenseController{
  private services =  expenseServices;

   // create
  create = asyncHandler(async (req, res) => {
    const result = await this.services.create(req.body, req.user._id);
    sendResponse(res,{
       success: true,
            statusCode: httpStatus.CREATED,
            message: 'Expense created successfully!',
            data: result
    })
  }
  )

    // read
    getAll = asyncHandler(async (req, res) => {
      const result = await this.services.getAll(req.user._id);
  
      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Expense retrieved successfully!',
        data: result
      });
    });
  
    // update
    update = asyncHandler(async (req, res) => {
      const result = await this.services.update(req.params.id, req.body);
  
      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Expense updated successfully!',
        data: result
      });
    });
  
    // delete
    delete = asyncHandler(async (req, res) => {
      await this.services.delete(req.params.id);
  
      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Expense deleted successfully!'
      });
    });
}

const expenseController = new ExpenseController();
export default expenseController;