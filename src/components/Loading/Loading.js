import React from 'react';

export default ({loading, height}) => {
  const h = height || 'auto';
  if (loading) {
    return <div className="loading" style={{height: h}}><div /></div>;
  }
  return false;
};
