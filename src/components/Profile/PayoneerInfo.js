import React from 'react';
import Loading from '../Loading';

export default ({loading, user}) => {
  if (loading) return <Loading loading height="100px" />;
  return (
    <dl className="">
      <dt>Status</dt> <dd>{user.payoneerStatus}</dd>
      <dt /><dd><a href={user.payoneerSignupUrl} target="_blank" rel={'noopener'}>Payoneer Link</a></dd>
    </dl>
  );
};
