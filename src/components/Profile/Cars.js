import React from 'react';
import {FormGroup, FormControl, Col, Row} from 'react-bootstrap';
import Loading from '../Loading';
import Picture from '../common/Picture';
import constants from '../../data/constants';

export default ({
  loading,
  user,
  selectedCar,
  onSelectCar,
  onSave,
  carDocuments,
}) => {
  if (loading) return <Loading loading height="200px" />;

  return (
    <Row className="top15">
      <Col sm={4}>
        <FormGroup controlId="formControlsSelect">
          <FormControl
            value={selectedCar.id}
            componentClass="select"
            onChange={({target: {value: id}}) => {
              const car = _.find(user.cars.slice(), {id: _.toNumber(id)});
              const sCar = Object.assign({}, car);
              sCar.inspectionNotes = sCar.inspectionNotes || '';
              onSelectCar(sCar);
            }}
          >
            {
              _.chain(user.cars)
                .sortBy(['removed', 'make', 'selected'])
                .map(car => <option value={car.id}>{car.make} {car.model} {car.removed ? ' [REMOVED]' : ''}</option>)
                .value()
            }
          </FormControl>
        </FormGroup>

        <FormGroup controlId="formControlsSelect">
          <FormControl
            value={selectedCar.inspectionStatus}
            disabled={selectedCar.removed}
            onChange={({target: {value: inspectionStatus}}) => {
              const car = Object.assign({},
                selectedCar,
                {
                  inspectionStatus,
                  driverId: user.id,
                  carId: selectedCar.id,
                });
              onSave(car);
            }}
            componentClass="select"
            placeholder="Inspection Status"
          >
            {_.map(constants.common.inspectionStatus, option =>
              <option value={option.value}>{option.name}</option>)}
          </FormControl>
        </FormGroup>

        <FormGroup controlId="formControlsTextarea">
          <FormControl
            disabled={selectedCar.removed}
            onChange={({target: {value: inspectionNotes}}) => {
              const car = Object.assign({},
                selectedCar,
                {
                  inspectionNotes,
                  driverId: user.id,
                  carId: selectedCar.id,
                });
              onSave(car);
            }}
            componentClass="textarea"
            placeholder="Inspection notes"
            value={selectedCar.inspectionNotes}
          />
        </FormGroup>
        <dl className="">
          <dt>Year</dt> <dd>{selectedCar.year}</dd>
          <dt>Color</dt> <dd>{selectedCar.color}</dd>
          <dt>License Number</dt> <dd>{selectedCar.license}</dd>
        </dl>
      </Col>
      <Col sm={8}>
        {carDocuments && carDocuments.length === 0 && <div>Car Photos Not Found</div>}
        {!carDocuments && <Loading loading height="100px" />}
        {_.map(carDocuments, doc =>
          <Col key={doc.id} sm={6}>
            <Picture
              picture={doc.documentUrl}
              name={doc.name}
              notChangeAble
            />
          </Col>)}
      </Col>
    </Row>
  );
};
