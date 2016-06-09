import React from 'react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import isArray from 'lodash/isArray';

class BlueFormIf extends React.Component {
  constructor(props) {
    super(props);
  }
  evalConditions() {
    const { children, condition, data, property, value } = this.props;
    const { formDoc } = this.context;

    /**
     * If no data provided the current formDoc will be used
     */

    let dataProp = formDoc;
    if (!!data) {
      dataProp = data;
    }

    if (typeof condition !== 'undefined') {
      return condition;
    }

    if (typeof value === "string" && value.indexOf("|") !== -1) {
      let values = value.split("|");

      let truthyVals = filter(values, function(value) {
        if (value === 'blankString') {
          return get(dataProp, property) === '';
        } else {
          return get(dataProp, property) === value;
        }
      });

      return truthyVals.length > 0;

    } else {
      return get(dataProp, property) === value;
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
  formDoc: React.PropTypes.object,
}

export default BlueFormIf;
