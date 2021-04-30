import React from 'react';
import { Col, FormGroup, DropdownButton, MenuItem, Tooltip, OverlayTrigger, Label } from 'react-bootstrap';

export default ({filters, funnel, onChange, filter}) => {
  function renderTooltip(tooltip, content) {
    return (
      <OverlayTrigger placement="top" overlay={<Tooltip id={_.uniqueId()}>{tooltip}</Tooltip>}>
        <span>{content}</span>
      </OverlayTrigger>
    );
  }

  function renderPendingFilter(filterId) { // eslint-disable-line
    const pendingFilter = _.find(funnel, {id: filterId});
    if (pendingFilter) {
      return (
        <Label className="valign-middle left5 filter-pending">{pendingFilter.drivers}</Label>
      );
    }
  }

  function getMultipleSelectValues(selectedOption, f) {
    let selectedFilters = f.selected.slice();

    if (selectedOption.id === '*') return [selectedOption];

    selectedFilters = _.filter(selectedFilters, ({id}) => id !== '*');

    const isSelectedOptionInSelectedFilters = _.find(selectedFilters, {id: selectedOption.id});

    if (isSelectedOptionInSelectedFilters) {
      selectedFilters = _.filter(selectedFilters, ({id}) => id !== selectedOption.id);
    } else {
      selectedFilters = [...selectedFilters, selectedOption];
    }

    const isSelectedFiltersEmpty = selectedFilters.length === 0;

    if (isSelectedFiltersEmpty) selectedFilters = [f.options[0]];

    return selectedFilters;
  }

  function replaceFilter(name, f) {
    const filterIndex = _.findIndex(filters.slice(), {name});
    filters[filterIndex] = f;
    return filters;
  }


  function onSelectFilter({option, filter} = {}) { // eslint-disable-line
    if (option && filter) {
      option = Object.assign({}, option);
      filter = Object.assign({}, filter);
      filter.selected = filter.single ? [option] : getMultipleSelectValues(option, filter);
      return replaceFilter(filter.name, filter);
    }
  }

  return (
    <Col xs={12} sm={3} md={3} lg={2} className="filter" key={filter.id}>
      <FormGroup>
        <div className="bottom3 filter-name">
          <span className="valign-middle name">
            {filter.toolTip && renderTooltip(filter.toolTip, filter.name)}
            {!filter.toolTip && <span>{filter.name}</span>}
          </span>
          {renderPendingFilter(filter.id)}
        </div>
        <DropdownButton
          disabled={filter.disabled}
          className="bottom10"
          block
          title={[<span className="dropdown-title">{filter.selected.map(({name}) => name).join(', ')}</span>]}
          id={`${filter.name.toLowerCase().split(' ').join('-')}-dropdown`}
        >
          {_.map(filter.options, option =>
            <MenuItem
              onClick={() => onChange(onSelectFilter({option, filter}))}
              active={filter.selected.map(({name}) => name).indexOf(option.name) > -1}
              key={`${filter.id}-${option.id}`}
              className={`menu-item-${filter.id}-${option.id.toLowerCase()}`}
            >{option.name}<i className={`fa fa-circle ${option.color || 'hidden'}`} />
            </MenuItem>)}
        </DropdownButton>
      </FormGroup>
    </Col>
  );
};
