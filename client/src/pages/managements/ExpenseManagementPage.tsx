import { DeleteFilled, EditFilled } from '@ant-design/icons';
import { SpinnerIcon } from '@phosphor-icons/react';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Flex, Modal, Pagination, Table } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import CustomInput from '../../components/CustomInput';
import toastMessage from '../../lib/toastMessage';
import { useCreateExpenseMutation, useDeleteExpenseMutation, useGetAllExpenseQuery, useUpdateExpenseMutation } from '../../redux/features/management/expenseApi';
import { ITableExpense } from '../../types/expense.types';

const ExpenseManagementPage = () => {
  const [current, setCurrent] = useState(1);
  const [query] = useState({
    name: '',
    limit: 10,
  });

  const { data: expenses, isFetching } = useGetAllExpenseQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page);
  };

  const tableData = expenses?.data?.map((expense: ITableExpense) => ({
    key: expense._id,
    title: expense.title,
    amount: expense.amount,
    description: expense.description,
    createdAt: new Date(expense.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }),
    updatedAt: new Date(expense.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }),
  }));

  const columns: TableColumnsType<any> = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      align: 'center',
    },
    {
      title: 'Description',
      key: 'description',
      dataIndex: 'description',
      align: 'center',
    },
    {
      title: 'Created On',
      key: 'createdAt',
      dataIndex: 'createdAt',
      align: 'center',
    },
    {
      title: 'Modified On',
      key: 'updatedat',
      dataIndex: 'updatedAt',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      render: (item) => {
        return (
          <div style={{ display: 'flex' }}>
            <UpdateExpenseModal expense={item} />
            <DeleteExpenseModal id={item.key} />
          </div>
        );
      },
      width: '1%',
    },
  ];

  return (
    <>
      {/* <ProductManagementFilter query={query} setQuery={setQuery} /> */}

      <AddExpenseModal />
      <Table
        size='small'
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />
      <Flex justify='center' style={{ marginTop: '1rem' }}>
        <Pagination
          current={current}
          onChange={onChange}
          defaultPageSize={query.limit}
          total={expenses?.meta?.total}
        />
      </Flex>
    </>
  );
};


/**
 * Add Expense Modal
 */
const AddExpenseModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const [createNewExpense, { isLoading }] = useCreateExpenseMutation();

  const onSubmit = async (data: FieldValues) => {
    const payload = {
      title: data.title,
      amount: Number(data.amount),
      description: data.description,
    };

    try {
      const res = await createNewExpense(payload ).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn center'
        style={{ backgroundColor: 'blue',width:"100%" ,marginTop:"1rem",marginBottom:"1rem"}}
      >
        Add New Expense
      </Button>
      <Modal title='Add New Expense' open={isModalOpen} onCancel={handleCancel} footer={null} >
        <form onSubmit={handleSubmit(onSubmit)} style={{ margin: '2rem' }}>
          <CustomInput name='title' label='Title' register={register} type='text' />
          <CustomInput name='amount' label='Amount' register={register} type='number' />
          <CustomInput name='description' label='Description' register={register} type='text' />
          <Flex justify='center' style={{ marginTop: '1rem' }}>
            <Button htmlType='submit' type='primary' disabled={isLoading}>
              {isLoading && <SpinnerIcon className='spin' weight='bold' />}
              Submit
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );
};

/**
 * Update Product Modal
 */
const UpdateExpenseModal = ({ expense }: { expense: ITableExpense & { key: string } }) => {
  const [updateExpense] = useUpdateExpenseMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: expense.title,
      amount:expense.amount,
      description: expense.description,
      createdAt:expense.createdAt,
      modifiedAt:expense.updatedAt,
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await updateExpense({ id: expense.key, payload: data }).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'green' }}
      >
        <EditFilled />
      </Button>
      <Modal title='Update Expense Info' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            name='title'
            errors={errors}
            label='Title'
            register={register}
            required={true}
          />
          <CustomInput
            name='description'
            errors={errors}
            label='Description'
            register={register}
            required={true}
          />
          <CustomInput
            errors={errors}
            label='Amount'
            type='number'
            name='amount'
            register={register}
            required={true}
          />
          <Flex justify='center'>
            <Button
              htmlType='submit'
              type='primary'
              style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
            >
              Update
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );
};

/**
 * Delete Product Modal
 */
const DeleteExpenseModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteExpense] = useDeleteExpenseMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteExpense(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'red' }}
      >
        <DeleteFilled />
      </Button>
      <Modal title='Delete Expense' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Are you want to delete this expense?</h2>
          <h4>You won't be able to revert it.</h4>
          <div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}
          >
            <Button
              onClick={handleCancel}
              type='primary'
              style={{ backgroundColor: 'lightseagreen' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(id)}
              type='primary'
              style={{ backgroundColor: 'red' }}
            >
              Yes! Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExpenseManagementPage;
