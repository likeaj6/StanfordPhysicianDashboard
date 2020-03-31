import React from 'react';
import PropTypes from 'prop-types';
import { Table, Checkbox, Pagination, Icon, Header, Label } from 'semantic-ui-react';

import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <Checkbox ref={resolvedRef} {...rest} />
      </>
    );
  },
);

const inputStyle = {
  padding: 0,
  margin: 0,
  height: 36,
  border: 0,
  background: 'transparent',
};

// Create an editable cell renderer
export const EditableCell = ({
  cell: { value: initialValue },
  row: { index },
  column: { id },
  updateCellData, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = e => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateCellData(index, id, value);
  };

  // If the initialValue is changed externall, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      style={inputStyle}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};

const TagsCell = ({
  cell: { value: array },
  row: { index },
  column: { id },
}) => <div as="h4" style={{
  color: "#ff6060"
}}>
    {array.map((tag) => {
      return (
        <Label>
          {tag.label}
          {tag.value != null && <Label.Detail>{tag.value}</Label.Detail>}
        </Label>
      )
    })}
</div>

const formatValueById = (id) => {
  switch (id) {
    case "temperature":
      return "°F" 
    case "spo2":
      return "%"
    case "resting_hr":
      return "%"
    default:
      return "";
  }
}

export const NegativeCell = ({
  cell: { value: initialValue },
  // row: { index },
  column: { id },
}) => <Header as="h4" style={{
  color: "#ff6060"
}}>
    <Icon name='warning sign' />
  {isNaN(initialValue) ? initialValue: initialValue.toFixed(1)}{formatValueById(id)}
</Header>

NegativeCell.propTypes = {
  cell: PropTypes.shape({
    value: PropTypes.any.isRequired,
  }),
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }),
  column: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
}

EditableCell.propTypes = {
  cell: PropTypes.shape({
    value: PropTypes.any.isRequired,
  }),
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }),
  column: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  updateCellData: PropTypes.func.isRequired,
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  NegativeCell,
  TagsCell,
  Cell: EditableCell,
};

const EnhancedTable = ({
  columns,
  data,
  setData,
  getCellProps,
  updateCellData,
  skipPageReset,
}) => {
  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize, selectedRowIds, globalFilter },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      // updateCellData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateCellData,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.allColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox.  Pagination is a problem since this will select all
          // rows even though not all rows are on the current page.  The solution should
          // be server side pagination.  For one, the clients should not download all
          // rows in most cases.  The client should only download data for the current page.
          // In that case, getToggleAllRowsSelectedProps works fine.
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    },
  );

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setPageSize(Number(event.target.value));
  };

  const removeByIndexs = (array, indexs) =>
    array.filter((_, i) => !indexs.includes(i));

  const deleteUserHandler = event => {
    const newData = removeByIndexs(
      data,
      Object.keys(selectedRowIds).map(x => parseInt(x, 10)),
    );
    setData(newData);
  };

  const addUserHandler = user => {
    const newData = data.concat([user]);
    setData(newData);
  };
  console.log('data:', data)
  // Render the UI for your table
  return (
    <Table striped sortable celled selectable collapsing {...getTableProps()}>
      {/* <TableToolbar
        numSelected={Object.keys(selectedRowIds).length}
        deleteUserHandler={deleteUserHandler}
        addUserHandler={addUserHandler}
        preGlobalFilteredRows={preGlobalFilteredRows}
        setGlobalFilter={setGlobalFilter}
        globalFilter={globalFilter}
      /> */}
      <Table.Header>
        {headerGroups.map(headerGroup => (
          <Table.Row {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <Table.HeaderCell
                {...(column.id !== 'selection' && column.isSorted
                  ? {
                    sorted: column.isSortedDesc ? 'descending' : 'ascending',
                  }
                  : {})}
                {...(column.id === 'selection'
                  ? column.getHeaderProps()
                  : column.getHeaderProps(column.getSortByToggleProps()))}
              >
                {column.render('Header')}
                {/* {column.id !== 'selection' ? (
                  <TableSortLabel
                    active={column.isSorted}
                    // react-table has a unsorted state which is not treated here
                  />
                ) : null} */}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {page.map((row, i) => {
          prepareRow(row);
          // console.log('row:', row.getRowProps());
          return (
            <Table.Row {...row.getRowProps()}>
              {row.cells.map(cell => {
                // console.log(cell)
                return (
                  <Table.Cell
                  {...cell.getCellProps()}
                  {...getCellProps(cell)}
                  collapsing
                  >
                    {cell.column.tags ? cell.render('TagsCell'): getCellProps(cell).negative
                      ? cell.render('NegativeCell')
                      : cell.render('Cell')}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          );
        })}
      </Table.Body>
      <Table.Footer fullWidth>
        <Table.Row>
          <Table.HeaderCell/>
          {/* <Pagination
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: 'All', value: data.length },
            ]}
            // count={data.length}
            // rowsPerPage={pageSize}
            activePage={pageIndex}
            // SelectProps={{
            //   inputProps: { 'aria-label': 'rows per page' },
            //   native: true,
            // }}
            onPageChange={handleChangePage}
            // onChangeRowsPerPage={handleChangeRowsPerPage}
            // ActionsComponent={TablePaginationActions}
          /> */}
        </Table.Row>
      </Table.Footer>

    </Table>
  );
};

EnhancedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  updateCellData: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
  skipPageReset: PropTypes.bool.isRequired,
};

export const SimpleCell = ({
  cell: { value: initialValue },
  // row: { index },
  // column: { id },
}) => <Table.Cell>{initialValue}</Table.Cell>

export { EnhancedTable as Table };
