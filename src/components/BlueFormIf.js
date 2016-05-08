import React from 'react';
import get from 'lodash/get';

class BlueFormIf extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { children, name, value } = this.props;
    const { formDoc } = this.context;
    let testVal = get(formDoc, name);
    if (testVal === value) {
      return (
          <div>
          { children }
        </div>
      );
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
