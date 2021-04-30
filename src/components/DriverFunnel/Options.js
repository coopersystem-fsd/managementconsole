import React from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import './Options.scss';

export default ({ filter, id, car, carPhotosStatus, x, y, onChange }) => {
  const style = {
    position: 'absolute',
    top: `${_.toNumber(y) + 20}px`,
    left: `${x}px`,
  };
  return (
    <div style={style} className="options-list">
      {filter &&
        <ListGroup>
          <ListGroupItem>
            <ul className="list-unstyled top0">
              {
                _.chain(filter.options)
                  .filter(opt => opt.id !== '*')
                  .map(opt =>
                    <li key={opt.id}>
                      <a
                        href=""
                        onClick={(e) => {
                          onChange({ option: opt, filter, id, car, carPhotosStatus });
                          e.preventDefault();
                        }}
                      >{opt.name} <i className={`fa fa-circle ${opt.color || 'hidden'}`} />
                      </a>
                    </li>)
                  .value()
              }
            </ul>
          </ListGroupItem>
        </ListGroup>
      }
    </div>
  );
};
