import { Col, Flex, Row } from 'antd';
import React from 'react';

interface SaleManagementFilterProps {
  query: {page:number, limit: number,search:string, filter?:'all'|'amountRemaining'|'dueDatePassed'};
  setQuery: React.Dispatch<
    React.SetStateAction<{page:number, limit: number,search:string, filter?:'all'|'amountRemaining'|'dueDatePassed'}>
  >;
}
const SaleManagementFilter = ({query, setQuery}: SaleManagementFilterProps) => {

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'all' | 'amountRemaining' | 'dueDatePassed';
    setQuery((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filter changes
      filter: value === 'all' ? undefined : value, // Use undefined for "all" to show all sales
    }));
  };

  return (
    <Flex
      style={{
        border: '1px solid grey',
        padding: '1rem',
        marginBottom: '.5rem',
        borderRadius: '1rem',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4) inset',
      }}
    >
      <Row gutter={2} style={{width: '100%'}}>
               <Col xs={{ span: 24 }} md={{ span: 8 }}>
          <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
            Filter Sales
          </label>
          <select
            className={`input-field`}
            value={query.filter || 'all'}
            onChange={handleFilterChange}
          >
            <option value="all">All Sales</option>
            <option value="amountRemaining">Amount Remaining &gt; 0</option>
            <option value="dueDatePassed">Due Date Passed</option>
          </select>
        </Col>
      </Row>
    </Flex>
  );
}
export default SaleManagementFilter
