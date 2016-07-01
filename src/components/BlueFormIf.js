import React from 'react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import isArray from 'lodash/isArray';

class BlueFormIf extends React.Component {
  constructor(props) {
    super(props);
  }
  propertyEqualsValue(conditional, dataProp) {
    let value = get(conditional, 'value');
    let property = get(conditional, 'property');

    if (typeof value === "string" && value.indexOf("|") !== -1) {
      let values = value.split("|");

      let truthyVals = filter(values, function(value) {
        if (value === 'blankString') {
          return get(dataProp, property) === '';
        } else if (value[0] === '!') {
          return get(dataProp, property) !== value.substr(1);
        } else {
          return get(dataProp, property) === value;
        }
      });

      return truthyVals.length > 0;

    } else {
      if (typeof value === 'string' && value[0] === '!') {
        return get(dataProp, property) !== value.substr(1);
      } else {
        return get(dataProp, property) === value;
      }
    }
  }
  evalConditions() {
    const { children, conditional } = this.props;
    const { formDoc } = this.context;
    let self = this;

    if (isArray(conditional)) {

      let bool = true;

      conditional.forEach(function(cond) {

        if (typeof cond.condition !== 'undefined') {
          if (!cond.condition) {
            bool = false;
          }
        }

        /**
         * If no data provided the current formDoc will be used
         */

        let dataProp = formDoc;
        if (get(cond, 'data')) {
          dataProp = get(cond, 'data');
        }

        if (!self.propertyEqualsValue(cond, dataProp)) {
          bool = false;
        }
      });

      return bool;
    } else {

      if (typeof conditional.condition !== 'undefined') {
        return conditional.condition;
      }

      /**
       * If no data provided the current formDoc will be used
       */

      let dataProp = formDoc;
      if (get(conditional, 'data')) {
        dataProp = get(conditional, 'data');
      }

      return self.propertyEqualsValue(conditional, dataProp);
    }
  }
  render() {
    const { children, condition, data, property, value } = this.props;
    const { formDoc } = this.context;

    if (!children) {
      return null;
    }

    let childrenNodes = isArray(children) ? children : [children];

    if (childrenNodes.length > 0) {
      if (this.evalConditions()) {
        return childrenNodes[0];
      } else {
        return null;
      }
    } else {
      return null;
    }

  }
};

BlueFormIf.contextTypes = {
  data: React.PropTypes.object,
  formDoc: React.PropTypes.object
}

export default BlueFormIf;
