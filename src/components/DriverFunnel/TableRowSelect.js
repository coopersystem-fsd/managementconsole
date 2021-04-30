import React from 'react';
import { Col } from 'react-bootstrap';
import constants from '../../data/constants';

export default ({type, filter, id, car, carPhotosStatus, onChange, disabled}) => {
  let option = _.find(filter.options, {id: type}) || {name: '', id: 'NOT_SET', color: null};

  if (filter.id === 'payoneerStatus') {
    option = _.find(constants.driverFunnel.colorMap.slice(), {name: type});
    option.id = type;
  }

  const carPhotoMap = { FRONT: 'Front', BACK: 'Back', INSIDE: 'Inside', TRUNK: 'Trunk' };
  const carTitle = car ? `${car.make}  ${car.model}` : null;
  const style = {
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.65 : 1,
    color: '#158cba',
    fontSize: '12px',
  };

  return (
    <Col
      style={{ whiteSpace: 'nowrap' }}
      className="table-row-select"
      onClick={(event) => {
        if (disabled) return;
        const state = {
          filter,
          id,
          car,
          carPhotosStatus,
          x: event.nativeEvent.layerX - event.nativeEvent.offsetX,
          y: event.nativeEvent.layerY - event.nativeEvent.offsetY,
        };
        onChange(state);
      }}
    >
      <span className="car-photo-title">
        <strong>
          <small>
            {carPhotosStatus ? carTitle : null}
          </small>
        </strong>
      </span>
      <span className={disabled ? '' : 'pointer'} style={style}>
        {carPhotoMap[carPhotosStatus] || carTitle || option.name}
        <i style={{paddingLeft: '5px'}} className={`fa fa-circle ${option.color || 'hidden'}`} />
      </span>
    </Col>
  );
};
