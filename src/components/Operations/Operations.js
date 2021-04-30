import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import {Button, Alert, ProgressBar} from 'react-bootstrap';

export default class Operations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maxDate: moment().endOf('day'),
      reportDate: moment(),
    };

    this.onDateChange = this.onDateChange.bind(this);
    this.onDone = this.onDone.bind(this);
  }

  onDateChange(date) {
    this.setState({reportDate: date});
  }

  onDone() {
    this.props.actions.done();
  }

  sendEarnings() {
    this.props.actions.sendDriversEarnings(this.state.reportDate.format('YYYY-MM-DD'));
  }

  render() {
    let percent =
      (this.props.operations.progressCurrent / this.props.operations.progressTotal) * 100;
    percent = isNaN(percent) ? 0 : percent;
    return (
      <div>
        {!this.props.operations.loading && <div>
          <Alert bsStyle="danger">
            <strong>This button actually sends reports to ALL active drivers. Please don{"'"}t press it
            unless you know what you are doing!</strong></Alert>
          <DatePicker
            className="form-control"
            dateFormat="YYYY-MM-DD"
            selected={
              this.state.reportDate}
            maxDate={this.state.maxDate}
            onChange={this.onDateChange}
          />
          <Button onClick={() => this.sendEarnings()}>Send driver reports</Button></div>}
        {this.props.operations.loading && <div>
          <h4>{percent === 100 ? 'Sent' : 'Sending'} drivers earnings</h4>
          <ProgressBar now={percent} label={`${parseInt(percent, 10)}%`} />
          {percent === 100 && <Button onClick={() => this.onDone()}>Done</Button>}
        </div>}
      </div>
    );
  }
}
