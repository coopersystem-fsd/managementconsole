import React from 'react';
import Loading from '../Loading';

export default ({loading, user}) => {
  if (loading) return <Loading loading height="100px" />;
  return (
    <dl className="">
      <dt>Expiry</dt> <dd>{user.licenseExpiryDate}</dd>
      <dt>License Number</dt> <dd>{user.licenseNumber}</dd>
    </dl>
  );
};
