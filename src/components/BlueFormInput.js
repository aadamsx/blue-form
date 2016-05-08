import React from 'react';
import MaskedInput from 'react-maskedinput';
import get from 'lodash/get';
import set from 'lodash/set';

class BlueFormInput extends React.Component {
  constructor(props, context) {
    super(props);
  }
  render() {
    const { className, mask, name, text, type = 'text' } = this.props;
    const { autosave, data, disabled, errors, formDoc, inputOnChange, onSubmit, schema, selectOnChange } = this.context;
    let schemaObject = schema._schema[name];

    switch (type) {
      case 'boolean-select':
        return (
          <div className="field">
            <label htmlFor={ name }>{ schemaObject.label }</label>
            <select name={ name } onChange={ selectOnChange } value={ get(formDoc, name) }>
              <option value="">(Select One)</option>
              <option value={ true }>Yes</option>
              <option value={ false }>No</option>
            </select>
          </div>
        );
      case 'select':
        return (
          <div className="field">
            <label htmlFor={ name }>{ schemaObject.label }</label>
            <select name={ name } onChange={ selectOnChange } value={ get(formDoc, name) }>
              <option value="">(Select One)</option>
              { schemaObject.allowedValues.map( (val, i) => {
                  return <option key={ i } value={ val }>{ val }</option>;
              }) }
            </select>
          </div>
        );
      case 'submit':
        return (
          <div className="field">
            <input type="submit" value={ !!text ? text : 'Submit' } className={ "ui large button " + className } disabled={ disabled } />
          </div>
        );
      case 'mask':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name }>{ schemaObject.label }</label>
            <MaskedInput mask={ mask.mask } placeholder={ mask.placeholder } name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } value={ get(formDoc, name) }/>
          </div>
        );
      case 'textarea':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name }>{ schemaObject.label }</label>
            <textarea name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } value={ get(formDoc, name) }/>
          </div>
        );
      default:
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name }>{ schemaObject.label }</label>
            <input type={ type } name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } value={ get(formDoc, name) }/>
          </div>
        );
    }
  }
};

BlueFormInput.contextTypes = {
  autosave: React.PropTypes.bool,
  data: React.PropTypes.object,
  disabled: React.PropTypes.bool,
  errors: React.PropTypes.object,
  formDoc: React.PropTypes.object,
  inputOnChange: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  schema: React.PropTypes.object,
  selectOnChange: React.PropTypes.func,
}

export default BlueFormInput;