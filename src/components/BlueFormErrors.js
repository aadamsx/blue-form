import React from 'react';
import keys from 'lodash/keys';

class BlueFormErrors extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { errors } = this.props
    let renderErrors = function(errors) {
      let errorKeys = keys(errors);
      return errorKeys.map((error, i) => {
        return <li key={ i } dangerouslySetInnerHTML={ {__html: errors[error]} } />;
      });
    };
    return (
        <div className="ui error message">
        <div className="header">Form Errors</div>
        <ui className="list">
        { renderErrors(errors) }
      </ui>
        </div>
    );
  }
};

export default BlueFormErrors;
