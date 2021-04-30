import { isEmail } from 'validator';

export const validateFields = fields =>
    Boolean(_.chain(fields)
      .map(({validation, value}) => validation(value))
      .reduce((a, b) => a + b)
      .value());


export default (field) => {
  const rules =
    _.chain(field)
      .map((v, k) => {
        if (k === 'required' && v) return a => _.chain(a).split(' ').compact().value().length === 0;
        if (k === 'email' && v) return a => !isEmail(a);
        if (k === 'maxLength' && v) return a => a.length > _.toNumber(v);
        if (k === 'minValue' && v) return a => _.toNumber(a) < _.toNumber(v);
        if (v) {
          return (a) => {
            if (a.length > 0) {
              const spaces = _.filter(a, b => b === ' ').length;
              const isOnlySpaces = a.length === spaces;
              return isOnlySpaces;
            }
            return false;
          };
        }
        return false;
      })
      .compact()
    .value();

  if (rules.length === 0) return () => false;

  const partialFunc = (rulesArray, value) =>
    Boolean(_.chain(rulesArray)
      .map(r => r(_.toString(value)))
      .reduce((a, b) => a + b)
    .value());

  return _.curry(partialFunc)(rules);
};
