import store from '../store';

export default (reportFields, id) => {
  const state = store.getState();
  const carCategories = state.common.carTypesMap ? state.common.carTypesMap.allItems : [];
  const requiredFields = ['startDateTime', 'endDateTime'];
  reportFields.forEach((report) => {
    report.id = _.uniqueId();
    if (report.parameterLabel === 'Started on after') report.parameterLabel = 'Start Date';
    if (report.parameterLabel === 'Started on before') report.parameterLabel = 'End Date';

    if (report.parameterType === 'ENUM') {
      const multiselectEnums = ['checkrStatus', 'payoneerStatus'];
      const multiselect = multiselectEnums.indexOf(report.parameterName) !== -1;
      report.multiselect = multiselect;
    }

    if (report.parameterName === 'carCategory') {
      report.multiselect = true;
      report.availableValues =
        carCategories.map(category => ({ title: category.title, value: category.carCategory }));
      report.realParameterType = report.parameterType;
      report.parameterType = 'ENUM';
    }

    if (requiredFields.indexOf(report.parameterName) !== -1) {
      report.required = true;
    }

    if (id === 7) {
      report.multiselect = true;
    }
  });
  return reportFields;
};
