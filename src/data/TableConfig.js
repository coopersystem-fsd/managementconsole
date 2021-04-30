export default class TableConfig {

  columns = [];
  propertyNameMap = {};
  options = {};

  constructor(columns, options) {
    this.options = options;
    if (columns.length) {
      columns.forEach((col) => {
        this.addColumn(col);
      });
    }
  }

  addColumn(col) {
    this.columns.push(col);
    this.propertyNameMap[col.property] = col.name;
  }

  isSortable(name) {
    const col = _.find(this.columns, {name});
    if (!col) {
      throw Error('Wrong column, check table config');
    }
    return col.sort !== false;
  }

  isSortableByPropName(prop) {
    const name = this.getNameByProperty(prop);
    return this.isSortable(name);
  }

  getNameByProperty(prop) {
    if (!this.propertyNameMap[prop]) {
      throw Error('Wrong property name, check table config');
    }
    return this.propertyNameMap[prop];
  }

  getPropertyByName(name) {
    const col = this.getColumnByName(name);
    return col.property;
  }

  getSortPropertyByName(name) {
    const col = this.getColumnByName(name);
    return typeof col.sort === 'string' ? col.sort : col.property;
  }

  getColumnByName(name) {
    const col = _.find(this.columns, {name});
    if (!col) {
      throw Error('Wrong column, check table config');
    }
    return col;
  }

  getSortableColumnsForTable() {
    return this.columns.filter(col => col.sort !== false).map(col => ({
      column: col.name,
      sortType: (col.sortType || this.options.defaultSortType || 'sync'),
    }));
  }

  getData(columnName) {
    const column = this.getColumnByName(columnName);
    return this.getDataByColumn(column);
  }

  getDataByColumn(column, data) {
    let prop = column.property;
    let result;
    if (typeof prop === 'function') {
      result = prop(data);
    } else {
      if (typeof prop !== 'string') {
        prop = prop.toString();
      }
      result = data[prop];
    }
    return result;
  }

  getDataMap(data) {
    const result = {};
    this.columns.forEach((column) => {
      result[column.name] = this.getDataByColumn(column, data);
    });

    return result;
  }
}
