import React, { Component } from 'react'; // eslint-disable-line

// /redirect/https?path=new/path
class Redirect extends Component {
  componentWillMount() {
    let path = this.props.location.query.path || '/';
    if (path[0] !== '/') path = `/${path}`;
    location.replace(`https://${location.host}${path}`);
  }

  render() {
    return null;
  }
}

export default Redirect;
