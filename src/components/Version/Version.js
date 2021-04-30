import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from './Version.scss';

const Version = (props) => {
  const buildVersion = props.buildVersion;
  const {projectVersion, buildNumber, gitCommit, gitBranch} = buildVersion;
  return (<div>
    {NODE_ENV && <div>Environment: {NODE_ENV}</div>}
    <div className={styles.version}>
      <h2>From Process</h2>
      {VERSION && <div>Console version: {VERSION}</div>}
      {BUILD_NUMBER && <div>Build number: {BUILD_NUMBER}</div>}
      {GIT_COMMIT && <div>Git commit: {GIT_COMMIT}</div>}
      {GIT_BRANCH && <div>Git branch: {GIT_BRANCH}</div>}
    </div>
    <div className={styles.version}>
      <h2>From Server</h2>
      {projectVersion && <div>Console version: {projectVersion}</div>}
      {buildNumber && <div>Build number: {buildNumber}</div>}
      {gitCommit && <div>Git commit: {gitCommit}</div>}
      {gitBranch && <div>Git branch: {gitBranch}</div>}
    </div>
  </div>);
};

Version.propTypes = {
  buildVersion: PropTypes.object, //eslint-disable-line
};


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  buildVersion: state.common.buildVersion,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Version);
