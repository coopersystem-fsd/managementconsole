import React from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import './Options.scss';

export default ({ options, id, x, y, carCategory, onChange }) => {
  const style = {
    position: 'absolute',
    top: `${_.toNumber(y) + 20}px`,
    left: `${x}px`,
  };
  return (
    <div style={style} className="options-list-common">
      {options &&
        <ListGroup>
          <ListGroupItem>
            <ul className="list-unstyled top0">
              {
                _.chain(options)
                  .map(option =>
                    <li key={option.id}>
                      <a
                        href=""
                        onClick={(e) => {
                          e.preventDefault();
                          onChange({ option, id, carCategory });
                        }}
                      >{option.name}</a>
                    </li>
                  )
                  .value()
              }
            </ul>
          </ListGroupItem>
        </ListGroup>
      }
    </div>
  );
};
