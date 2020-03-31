/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
// import styled from 'styled-components';
import moment from 'moment';
import messages from './messages';
import makeData from './mockData';
import { Table } from '../../components/Table';

function isCellNegative(id, value) {
  switch (id) {
    case 'temperature':
      return value > 99;
    case 'spo2':
      return value <= 88;
    case 'resting_hr':
      return value > 5;
    default:
      return false;
  }
}
const mockData = makeData(20);
export default function HomePage() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Patient',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
            Cell: props => `${props.cell.value}`,
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
            Cell: props => `${props.cell.value}`,
          },
        ],
      },
      {
        Header: 'Status',
        columns: [
          {
            id: 'temperature',
            Header: 'Last Temp',
            accessor: 'temperature',
            // accessor: d => `${d.temperature} °F`,
            Cell: props =>
              isCellNegative(props.id, props.cell.value)
                ? `${props.cell.value.toFixed(1)}°F`
                : `${props.cell.value.toFixed(1)}°F`,
          },
          {
            id: 'spo2',
            Header: 'Last SpO2',
            accessor: 'spo2',
            Cell: props =>
              isCellNegative(props.id, props.cell.value)
                ? `${props.cell.value}%`
                : `${props.cell.value}%`,
          },
          {
            id: 'resting_hr',
            Header: 'Last Resting HR % increase',
            accessor: 'resting_hr',
            Cell: props =>
              isCellNegative(props.id, props.cell.value)
                ? `${props.cell.value.toFixed(1)}%`
                : `${props.cell.value.toFixed(1)}%`,
          },
          {
            Header: 'Last Symptoms',
            accessor: 'symptoms',
            tags: true,
          },
          {
            Header: 'Status',
            accessor: 'status',
            tags: true,
          },
          {
            Header: 'Last Contacted',
            accessor: 'lastContactDate',
            Cell: props =>
              `${moment(props.cell.value).format('ddd, MMM D YYYY')}`,
          },
          {
            Header: 'Notes',
            accessor: 'notes',
          },
        ],
      },
    ],
    [],
  );

  const [data, setData] = React.useState(mockData);
  console.log('rendering');
  console.log('mock:', mockData);
  return (
    <div
      style={{
        width: '80%',
        marginLeft: '10%',
      }}
    >
      <h1 style={{ marginTop: '2rem' }}>
        <FormattedMessage {...messages.header} />
      </h1>
      <Table
        columns={columns}
        data={data}
        setData={setData}
        getCellProps={cellInfo => ({
          negative: isCellNegative(cellInfo.column.id, cellInfo.value),
        })}
        updateCellData={() => {}}
        skipPageReset={false}
      />
      {/* <Table
      
        headerRow={headerRow}
        renderBodyRow={renderBodyRow}
        tableData={tableData}
      />     */}
    </div>
  );
}
