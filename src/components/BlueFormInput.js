import React from 'react';
import MaskedInput from 'react-maskedinput';
import assignIn from 'lodash/assignIn';
import get from 'lodash/get';
import set from 'lodash/set';
import throttle from 'lodash/throttle';

class BlueFormInput extends React.Component {
  constructor(props, context) {
    super(props);
    this.renderError = this.renderError.bind(this);
    this.getFieldType = this.getFieldType.bind(this);
  }
  componentDidMount() {
    const { name } = this.props;
    const { form, inputOnChange, onSelectDate } = this.context;

    const fieldType = this.getFieldType();
    const schemaObj = form.schema._schema[name];
    let self = this;

    /**
     * Initialize if of type checkbox
     */
    if (fieldType === 'checkbox') {
      $('.ui.checkbox').checkbox({
        onChange() {
          let fakeEvent = {
            target: this,
            checkbox: true
          };
          inputOnChange(fakeEvent);
        }
      });
    }

    /**
     * Initialize datepicker
     */
    if (fieldType === 'datetime') {
      let options = {
        onSelectDate(ct, $i) {
          onSelectDate($i[0].value, name);
        }
      };

      if (get(schemaObj, 'blueform.datetimeOptions')) {
        assignIn(options, schemaObj.blueform.datetimeOptions);
      }

      $('.datetimepicker').datetimepicker(options);
    }
  }
  getFieldType() {
    const { name, type = 'text' } = this.props;
    const { form } = this.context;

    let schemaObj = form.schema._schema[name];
    let fieldType;
    if (get(schemaObj, 'blueform.type')) {
      fieldType = get(schemaObj, 'blueform.type');
    } else {
      fieldType = type;
    }
    return fieldType;
  }
  renderError() {
    const { name } = this.props;
    const { errors } = this.context;
    if (!!errors[name]) {
      return (
          <div className="ui pointing red basic label">{ errors[name] }</div>
      );
    } else {
      return '';
    }
  }
  render() {
    const { className, inputOpts, mask, name, text, type = 'text' } = this.props;
    const { autosave, data, disabled, errors, form, formDoc, inputOnChange, onSubmit, selectOnChange } = this.context;

    const fieldType = this.getFieldType();
    let schemaObj;
    let fieldValue;
    if (fieldType !== 'submit') {
      schemaObj = form.schema._schema[name];
      fieldValue = get(formDoc, name);
    }

    let maskOpts;
    if (fieldType === 'mask') {
      maskOpts = mask;
      if (get(schemaObj, 'blueform.maskOpts')) {
        maskOpts = get(schemaObj, 'blueform.maskOpts');
      }
    }

    let options = inputOpts;
    if (get(schemaObj, 'blueform.inputOpts')) {
      options = get(schemaObj, 'blueform.inputOpts');
    }

    switch (fieldType) {
      case 'boolean-select':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <select name={ name } onChange={ selectOnChange } value={ !!fieldValue ? fieldValue : '' }>
              <option value="">(Select One)</option>
              <option value={ true }>Yes</option>
              <option value={ false }>No</option>
            </select>
            { this.renderError() }
          </div>
        );
      case 'checkbox':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <div className="ui checkbox">
            <input name={ name } id={ name } type="checkbox" defaultChecked={ !!fieldValue ? fieldValue : false } defaultValue={ !!fieldValue ? fieldValue : false }/>
              <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            </div>
            { this.renderError() }
          </div>
        );
      case 'datetime':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <input type={ type } className="datetimepicker" name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } placeholder={ !!get(schemaObj, 'blueform.placeholder') ? get(schemaObj, 'blueform.placeholder') : null } defaultValue={ !!fieldValue ? fieldValue : '' }/>
            { this.renderError() }
          </div>
        );
      case 'mask':
        return (
            <div className={ !!errors[name] ? 'field error' : 'field' }>
              <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <MaskedInput mask={ maskOpts.mask } placeholder={ !!get(schemaObj, 'blueform.placeholder') ? get(schemaObj, 'blueform.placeholder') : null } name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } value={ !!fieldValue ? fieldValue : '' }/>
            { this.renderError() }
            </div>
        );
      case 'select':
        let selectOptions;
        if (!!(get(schemaObj, 'blueform.selectOptions'))) {
          let blueformSelectOptions = get(schemaObj, 'blueform.selectOptions');
          selectOptions = blueformSelectOptions.map((option, i) => {
            return <option key={ i } value={ option.value }>{ option.label}</option>;
          });
        } else {
          selectOptions = schemaObj.allowedValues.map((val, i) => {
            if (val === '') {
              return null;
            }
            return <option key={ i } value={ val }>{ val }</option>;
          });
        }

        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <select name={ name } onChange={ selectOnChange } value={ !!fieldValue ? fieldValue : '' }>
              <option value="">(Select One)</option>
              { selectOptions }
            </select>
            { this.renderError() }
          </div>
        );
      case 'submit':
        return (
          <div className="field">
            <input type="submit" value={ !!text ? text : 'Submit' } className={ "ui button " + className } disabled={ disabled } />
          </div>
        );
      case 'text':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <input type={ type } name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } placeholder={ !!get(schemaObj, 'blueform.placeholder') ? get(schemaObj, 'blueform.placeholder') : null } value={ !!fieldValue ? fieldValue : '' } { ...options } />
            { this.renderError() }
          </div>
        );
      case 'textarea':
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <textarea name={ name } rows={ get(schemaObj, 'blueform.rows') } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } value={ !!fieldValue ? fieldValue : '' }/>
            { this.renderError() }
          </div>
        );
      default:
        return (
          <div className={ !!errors[name] ? 'field error' : 'field' }>
            <label htmlFor={ name } dangerouslySetInnerHTML={ {__html: schemaObj.label} } />
            <input type={ type } name={ name } onBlur={ !!autosave ? onSubmit : null } onChange={ inputOnChange } placeholder={ !!get(schemaObj, 'blueform.placeholder') ? get(schemaObj, 'blueform.placeholder') : null } value={ !!fieldValue ? fieldValue : '' }/>
            { this.renderError() }
          </div>
        );
    }
  }
};

BlueFormInput.contextTypes = {
  autosave: React.PropTypes.bool,
  checkboxOnChange: React.PropTypes.func,
  data: React.PropTypes.object,
  disabled: React.PropTypes.bool,
  errors: React.PropTypes.object,
  form: React.PropTypes.object,
  formDoc: React.PropTypes.object,
  inputOnChange: React.PropTypes.func,
  onSelectDate: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  selectOnChange: React.PropTypes.func
}

export default BlueFormInput;
