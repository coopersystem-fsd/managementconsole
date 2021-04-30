import React, { Component, PropTypes } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import TNCList from './TNCList';
import TNCEdit from './TNCEdit';

class TNCView extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    show: PropTypes.bool,
    document: PropTypes.object,
    userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    carId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    driverPhotoType: PropTypes.string,
  }

  // Default Props Value
  static defaultProps = {
    singleDocument: false,
    show: false,
    sm: 3,
    driverPhotoType: 'TNC_CARD',
    document: {
      all: [],
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
    };

    this.closeModal = this.closeModal.bind(this);
    this.onAddPressed = this.onAddPressed.bind(this);
    this.onSaveDocument = this.onSaveDocument.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
    this.onItemEdit = this.onItemEdit.bind(this);
  }

  componentWillMount() {
    this.state = {
      show: this.props.show,
    };
  }

  componentDidMount() {
    this.refreshDocumentsData();
  }

  onItemDelete(ev, el) {
    return this.props.actions.deleteDocument(el.id).then(() => this.refreshDocumentsData());
  }

  onItemEdit(ev, el) {
    this.setState({ showModal: true, editingItem: el });
  }

  onSaveDocument(data) {
    return this.props.actions.saveDocument(data)
      .then((d) => {
        this.refreshDocumentsData();
        return d;
      });
  }

  onAddPressed() {
    this.setState({ showModal: true, editingItem: null });
  }

  refreshDocumentsData() {
    const userId = this.props.userId;
    const carId = this.props.carId;
    const params = {
      // TODO: Uncomment when server will support it
      // driverPhotoType: this.props.driverPhotoType,
    };

    if (this.props.onChange) this.props.onChange();

    if (carId) {
      this.props.actions.getCarDocuments({userId, carId, params});
    } else {
      this.props.actions.getDocuments({userId, params});
    }
  }

  closeModal() {
    if (this.state.showModal) this.setState({showModal: false, editingItem: null});
  }

  render() {
    const userId = this.props.userId;
    const carId = this.props.carId;
    const list =
      (carId ?
        this.props.document[carId] :
        (this.props.document.users[userId] && this.props.document.users[userId].all))
      || [];
    const items = list.filter(el => el.documentType === this.props.driverPhotoType);
    const citiesWithoutTNCCards =
      _.filter(this.props.cities, ({id}) => {
        const cardExists = _.find(items, {cityId: id});
        return !cardExists;
      });

    return (
      <Row>
        <TNCList
          data={items}
          cities={this.props.cities}
          onEdit={this.onItemEdit}
          onDelete={this.onItemDelete}
          sm={this.props.sm}
          onSave={this.onSaveDocument}
        />
        {citiesWithoutTNCCards.length > 0 &&
          <Col sm={12}>
            <Button bsStyle="primary" block onClick={this.onAddPressed} sm={3}>
              Add Document
            </Button>
          </Col>
        }
        <TNCEdit
          heya="aaa"
          items={items}
          cities={citiesWithoutTNCCards}
          onClose={this.closeModal}
          show={this.state.showModal}
          onSaveDocument={this.onSaveDocument}
          userId={this.props.userId}
          carId={carId}
          driverPhotoType={this.props.driverPhotoType}
          editingItem={this.state.editingItem}
        />
      </Row>
    );
  }
}

export default TNCView;
