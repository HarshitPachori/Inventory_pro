import { DeleteFilled, EditFilled } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Flex, Modal, Pagination, Table } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import CustomInput from '../../components/CustomInput';
import SaleManagementFilter from '../../components/query-filters/SaleManagementFilter';
import SearchInput from '../../components/SearchInput';
import toastMessage from '../../lib/toastMessage';
import { useDeleteSaleMutation, useGetAllSaleQuery, useUpdateSaleMutation } from '../../redux/features/management/saleApi';
import { ITableSale } from '../../types/sale.type';
import formatDate from '../../utils/formatDate';

interface ITableSaleData {
    key: string,
    productName: string,
    productPrice: number,
    buyerName: string,
    quantity: number,
    totalPrice: number,
    date: string,
    dueDate:string,
    amountPaid:number,
    amountRemaining: number,
}

const SaleManagementPage = () => {
  const [query, setQuery] = useState<{
    page: number;
    limit: number;
    search: string;
    filter?: 'all' | 'amountRemaining' | 'dueDatePassed';
  }>({
    page: 1,
    limit: 10,
    search: "",
    filter: "all"
  });

  const { data, isFetching } = useGetAllSaleQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery((prev) => ({ ...prev, page: page }));
  };

  const tableData = data?.data?.map((sale: ITableSale) => ({
    key: sale._id,
    productName: sale.productName,
    productPrice: sale.productPrice,
    buyerName: sale.buyerName,
    quantity: sale.quantity,
    totalPrice: sale.totalPrice,
    date: formatDate(sale.date),
    dueDate: formatDate(sale.dueDate),
    amountPaid: sale.amountPaid || 0,
    amountRemaining: sale.totalPrice - (sale.amountPaid || 0),
  }));

  const columns: TableColumnsType<any> = [
    {
      title: 'Product Name',
      key: 'productName',
      dataIndex: 'productName',
    },
    {
      title: 'Product Price',
      key: 'productPrice',
      dataIndex: 'productPrice',
      align: 'center',
    },
    {
      title: 'Buyer Name',
      key: 'buyerName',
      dataIndex: 'buyerName',
      align: 'center',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      dataIndex: 'quantity',
      align: 'center',
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      dataIndex: 'totalPrice',
      align: 'center',
    },
    {
      title: 'Selling Date',
      key: 'date',
      dataIndex: 'date',
      align: 'center',
    },
    {
      title: 'Amount Paid',
      key: 'amountPaid',
      dataIndex: 'amountPaid',
      align: 'center',
    },
    {
      title: 'Amount Remaining',
      key: 'amountRemaining',
      dataIndex: 'amountRemaining',
      align: 'center',
    },
    {
      title:'Due Date',
      key:'dueDate',
      dataIndex:'dueDate',
      align:'center'
    },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      render: (item) => {
        return (
          <div style={{ display: 'flex' }}>
            <UpdateModal sale={item} />
            <DeleteModal id={item.key} />
          </div>
        );
      },
      width: '1%',
    },
  ];

  // const onDateChange: DatePickerProps['onChange'] = (_date, dateString) => {
  //   setDate(dateString as string);
  // };

  return (
    <>
<SaleManagementFilter query={query} setQuery={setQuery} />
      <Flex justify='end' style={{ margin: '5px', gap: 4 }}>
        {/* <DatePicker
          onChange={onDateChange}
          placeholder='Search by Selling date...'
          style={{ minWidth: '250px' }}
        /> */}
        <SearchInput setQuery={setQuery} placeholder='Search Sold Products...' />
      </Flex>
      <Table
        size='small'
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />
      <Flex justify='center' style={{ marginTop: '1rem' }}>
        <Pagination
          current={query.page}
          onChange={onChange}
          defaultPageSize={query.limit}
          total={data?.meta?.total}
        />
      </Flex>
    </>
  );
};

/**
 * Update Modal
 */
const UpdateModal = ({ sale }: { sale: ITableSaleData }) => {
console.log(sale.dueDate)
console.log(formatDate(new Date(0).toISOString()))
console.log(sale.dueDate === formatDate(new Date(0).toISOString()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateSale] = useUpdateSaleMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      amountPaid: sale.amountPaid,
      dueDate: sale.dueDate ? new Date(sale.dueDate).toISOString().split('T')[0]: "",
    },
  });

  // const amountPaid = watch('amountPaid');

 const onSubmit = async (data: FieldValues) => {
    try {
      const payload: { amountPaid: number; dueDate?: string | null } = {
        amountPaid: data.amountPaid,
        dueDate:data.dueDate,
      };
      console.log({data,payload});

      // If amountPaid equals or exceeds totalPrice, set dueDate to null
      if (data.amountPaid >= sale.totalPrice) {
        payload.dueDate = null;
      }

      const res = await updateSale({ id: sale.key, payload }).unwrap();
      console.log({res});
      
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
    reset();
  };

  return (
    <>
      <Button
        onClick={showModal}
        type="primary"
        className="table-btn-small"
        style={{ backgroundColor: 'green' }}
      >
        <EditFilled />
      </Button>
      <Modal title="Update Sale Info" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            name="amountPaid"
            errors={errors}
            label="Amount Paid"
            type="number"
            register={register}
            required={true}
          />
          <div>
          <CustomInput
            name="dueDate"
            errors={errors}
            label="Due Date"
            type="date"
            register={register}
            required={true}
          />
          </div>
          <Flex justify="center" style={{ marginTop: '1rem' }}>
            <Button
              htmlType="submit"
              type="primary"
              style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
            >
              Update
            </Button>
          </Flex>
        </form>
      </Modal>
    </>);
};

/**
 * Delete Modal
 */
const DeleteModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSale] = useDeleteSaleMutation();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSale(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
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
        style={{ backgroundColor: 'red' }}
      >
        <DeleteFilled />
      </Button>
      <Modal title='Delete Product' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Are you want to delete this product?</h2>
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

export default SaleManagementPage;
