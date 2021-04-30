import React, { Component, PropTypes } from 'react';
import { Pagination } from 'react-bootstrap';

import './PaginatedTable.scss';
import { getPaginationInfo } from '../../helpers/common';
import { Table } from '../../lib/reactable';
import Loading from '../Loading';
import TableConfig from '../../data/TableConfig';

class PaginatedTable extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    autoRender: PropTypes.bool,
    dataProp: PropTypes.string,
  }

  // Default Props Value
  static defaultProps = {
    loadingText: 'Loading data',
    dataProp: 'content',
    autoRender: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.setData = this.setData.bind(this);
    this.onPaginationClick = this.onPaginationClick.bind(this);
    this.renderPagination = this.renderPagination.bind(this);
    this.renderPaginationInfo = this.renderPaginationInfo.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.setSorting = this.setSorting.bind(this);
    this.getSorting = this.getSorting.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
  }


  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onPaginationClick(page) {
    if (this.state.currentPage === page - 1) {
      return;
    }
    this.props.onPageChange(page - 1);
  }

  onSortChange(e) {
    let data = null;
    if (this.tableConfig) {
      const sort = {
        column: this.tableConfig.getSortPropertyByName(e.column),
        desc: e.direction === 1,
        type: e.sortType,
      };
      const tableSort = {
        direction: e.direction,
        column: e.column,
      };
      data = { tableSort, sort };
      this.setState({ tableSort });
    }
    if (this.props.onSortChange) {
      this.props.onSortChange(e, data);
    }
  }

  getSortPropertyByName(name) {
    return this.tableConfig ? this.tableConfig.getSortPropertyByName(name) : null;
  }

  getSorting() {
    return this.tableConfig && this.tableConfig.getSortableColumnsForTable();
  }

  getRenderedData() {
    let renderedData = this.props.data;
    if (!renderedData && this.props.dataProp && this.props.autoRender) {
      renderedData = this.props.serverResponse[this.props.dataProp];
      renderedData = renderedData.map(ride =>
        this.tableConfig.getDataMap(ride));
    }
    return renderedData;
  }

  setSorting(sortingOptions, defaultSortType) {
    this.tableConfig = new TableConfig(sortingOptions, defaultSortType);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {
      serverResponse: {
        number: currentPage,
        size: pageSize,
        totalPages,
        totalElements: totalItems,
      } = {},
      className,
      maxPaginationButtons = 10,
      noDataText = 'No items found',
      tableClassName = 'table table-striped table-bordered table-condensed table-hover',
      defaultSort,
      defaultSortType = {defaultSortType: 'async'},
      sortable,
      loading,
    } = props;

    if (!this.tableConfig && sortable) this.setSorting(sortable, defaultSortType);

    this.setState({
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      className,
      maxPaginationButtons,
      noDataText,
      tableClassName,
      defaultSort,
      sortable: this.getSorting(),
      loading,
    });
  }

  handleClick({target}) {
    function findElement({element, elementType}) {
      if (element.nodeName === elementType) return element;
      const parentElement = element.parentNode;
      return findElement({element: parentElement, elementType});
    }
    if (target.nodeName === 'TH' && this.props.onHeaderClick) {
      const tableHeader = findElement({element: target, elementType: 'TR'});
      this.props.onHeaderClick(tableHeader);
    }
    if (target.nodeName === 'TD' && this.props.onRowClick) {
      const tableRow = findElement({element: target, elementType: 'TR'});
      this.props.onRowClick(tableRow);
    }
  }

  renderPagination(position) {
    const {
      currentPage,
      totalPages,
      maxPaginationButtons,
      totalItems,
      pageSize,
    } = this.state;

    if (totalItems > pageSize) {
      return (
        <div className={`pagination-wrapper ${position}`}>
          <Pagination
            className={`pagination ${position}`}
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            items={totalPages}
            maxButtons={maxPaginationButtons}
            activePage={currentPage + 1}
            onSelect={this.onPaginationClick}
          />
          {this.renderPaginationInfo(position)}
        </div>
      );
    }

    return this.renderPaginationInfo(position);
  }

  renderPaginationInfo(position) {
    const {
      currentPage,
      totalItems,
      pageSize,
    } = this.state;
    const page = currentPage + 1;
    return (
      <span>
        <span className={`${position} pagination-info`}>
          {getPaginationInfo({currentPage: page, totalItems, pageSize})}
        </span>
        {this.props.rightHeaderContent && position === 'top' && this.props.rightHeaderContent()}
      </span>
    );
  }

  renderTable() {
    const {
      sortable,
      noDataText,
      tableClassName,
      defaultSort,
    } = this.state;

    const renderedData = this.getRenderedData();

    const sort = this.state.tableSort ? this.state.tableSort : defaultSort;
    return (
      <div className="table-responsive responsive-mobile">
        <Table
          onClick={this.handleClick}
          className={`${tableClassName}`}
          sortable={sortable}
          onSort={this.onSortChange}
          noDataText={noDataText}
          data={renderedData}
          defaultSort={sort}
        />
      </div>
    );
  }

  render() {
    const {className, loading, loadingText} = this.state;
    if (loading) {
      return (
        <Loading loading={loading} text={loadingText} height="300px" />
      );
    }
    return (
      <section className={`${className || ''} paginatedTable`}>
        {this.renderPagination('top')}
        {this.renderTable()}
        {this.renderPagination('bottom')}
      </section>
    );
  }
}

export default PaginatedTable;
