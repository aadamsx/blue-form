import React from 'react';
import BlueFormErrors from 'components/BlueFormErrors.js';
import BlueFormInput from 'components/BlueFormInput.js';
import BlueFormIf from 'components/BlueFormIf.js';

import assignIn from 'lodash/assignIn';
import forOwn from 'lodash/forOwn';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import set from 'lodash/set';
import throttle from 'lodash/throttle';
import unset from 'lodash/unset';

class BlueForm extends React.Component {
  constructor(props) {
    super(props);
    this.inputOnChange = this.inputOnChange.bind(this);
    this.selectOnChange = this.selectOnChange.bind(this);
    this.cleanFormDoc = this.cleanFormDoc.bind(this);
    this.onSelectDate = this.onSelectDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.renderField = this.renderField.bind(this);
    this.renderFields = this.renderFields.bind(this);
    this.renderSections = this.renderSections.bind(this);

    const { data = {}, form, type = 'insert' } = this.props;
    let formDoc = {};
    if (type === 'update') {
      let schemaKeys = keys(form.schema._schema);
      formDoc = pick(data, schemaKeys);
    }
    this.state = {
      disabled: false,
      errors: {},
      formDoc: formDoc
    };
  }
  componentWillReceiveProps(nextProps) {
    const { data, type = 'insert' } = nextProps;
    if (type === 'update') {
      this.setState({
        formDoc: data
      });
    }
  }
  getChildContext() {
    const { autosave, clearOnSuccess = true, data, disableOnSubmit = false, form, type = 'insert' } = this.props;
    const { disabled, errors, formDoc } = this.state;
    let context = {
      autosave: autosave,
      clearOnSuccess: clearOnSuccess,
      disabled: disabled,
      disableOnSubmit: disableOnSubmit,
      form: form,
      formDoc: formDoc,
      errors: errors,
      inputOnChange: this.inputOnChange,
      onSelectDate: this.onSelectDate,
      onSubmit: this.onSubmit,
      selectOnChange: this.selectOnChange,
      type: type
    };
    if (data && type === 'update') {
      assignIn(context, {
        data: data
      });
    }
    return context;
  }
  onSelectDate(date, name) {
    let { formDoc } = this.state;

    set(formDoc, name, date);

    this.setState({
      formDoc
    });

    this.validateInput(name);
  }
  inputOnChange(e) {
    let { autosave } = this.props;
    let { formDoc } = this.state;

    let name = e.target.getAttribute('name');
    let val = e.target.value;
    if (e.checkbox) {
      val = e.target.checked;
    }

    set(formDoc, name, val);

    this.setState({
      formDoc
    });

    if (autosave && e.checkbox) {
      this.onSubmit();
    }

    this.validateInput(name);
  }
  selectOnChange(e) {
    let { autosave } = this.props;
    let { formDoc } = this.state;

    let name = e.target.getAttribute('name');
    let val = e.target.value;

    if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }

    if (val === '(Select One)') {
      unset(formDoc, name);
    } else {
      set(formDoc, name, val);
    }

    this.setState({
      formDoc
    });

    if (autosave) {
      this.onSubmit();
    }

    this.validateInput(name);
  }
  validateInput(name) {
    let { form } = this.props;
    let { formDoc } = this.state;
    let schemaContext = form.schema.newContext();
    let cleanDoc = this.cleanFormDoc(formDoc);
    let isValid = schemaContext.validateOne(cleanDoc, name);
    let errors = {};
    if (isValid) {
      this.setState({
        disabled: false,
        errors: errors
      });
    } else {
      let invalidKeys = schemaContext.invalidKeys();
      invalidKeys.forEach(function(key) {
        errors[key.name] = schemaContext.keyErrorMessage(key.name);
      });
      this.setState({
        disabled: true,
        errors: errors
      });
    }
  }
  cleanFormDoc(formDoc) {
    let cleanedDoc = {};
    const { form } = this.props;
    /**
     * Use lodash _.set method to set value of nested properties
     */
    forOwn(formDoc, function(val, key) {
      if (form.schema._schemaKeys.indexOf(key) !== -1) {
        set(cleanedDoc, key, val);
      }
    });

    return cleanedDoc;
  }
  onSubmit(e) {
    /**
     * Check that event exists as this function may be called
     * by other component functions without passing an event
     */
    if (e) {
      e.preventDefault();
    }
    const { clearOnSuccess = true, disableOnSubmit = false, form, onError, submit, type = 'insert' } = this.props;
    const { disabled, formDoc } = this.state;
    let schemaContext = form.schema.newContext();
    let cleanDoc = this.cleanFormDoc(formDoc);
    let isValid = schemaContext.validate(cleanDoc);

    if (isValid) {
      this.setState({
        disabled: disableOnSubmit,
        errors: {}
      });
      if (clearOnSuccess && type === 'insert') {
        /**
         * Clear form values
         */
        this.setState({
          formDoc: {}
        });
      }
      submit(cleanDoc);
    } else {
      let invalidKeys = schemaContext.invalidKeys();
      let errors = {};
      invalidKeys.forEach(function(key) {
        errors[key.name] = schemaContext.keyErrorMessage(key.name);
      });
      this.setState({
        errors: errors
      });
      if (onError) {
        onError(errors);
      }
    }
  }
  renderField(form, key, i) {
    let schemaObj = form.schema._schema[key];
    if (get(schemaObj, 'blueform.conditional')) {
      return (
          <BlueFormIf key={ i } conditional={ get(schemaObj, 'blueform.conditional') } >
          <BlueFormInput name={ key } />
          </BlueFormIf>
      );
    } else {
      return <BlueFormInput key={ i } name={ key } />;
    }
  }
  renderFields(fields) {
    const { form } = this.props;

    let renderedFields = fields.map((key, i) => {
      if (typeof key === 'object') {
        return (
          <div key={ i } className={ key.className }>
            { key.fields.map((innerKey, innerI) => {
              return this.renderField(form, innerKey, innerI);
            })}
          </div>
        );
      } else {
        return this.renderField(form, key, i);
      }
    });
    return renderedFields;
  }
  renderSections(sections) {
    const { form } = this.props;
    let self = this;
    /**
     * Make sure section fields exist in schema
     */
    let schemaKeys = keys(form.schema._schema);
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        /**
         * Check if field is a custom object instead of a string
         */
        if (typeof field === 'object') {
          field.fields.forEach((innerField) => {
            if (!includes(schemaKeys, innerField)) {
              throw new Error(`Section field ${innerField} does not exist in schema`);
            }
          });
        } else {
          if (!includes(schemaKeys, field)) {
            throw new Error(`Section field ${field} does not exist in schema`);
          }
        }
      });
    });
    let renderedSections = sections.map((section, i) => {
      return (
        <div key={ i } className="ui segment">
          <h3>{ section.title }</h3>
          { self.renderFields(section.fields) }
        </div>
      );
    });
    return renderedSections;
  }
  render() {
    const { autosave, children, form, type } = this.props;
    const { errors, formDoc } = this.state;
    const self = this;
    if (!!children) {
      return (
        <form className="ui form" onSubmit={ this.onSubmit }>
        { children }
        </form>
      );
    } else if (!!form.sections) {
      return (
        <form className="ui form" onSubmit={ this.onSubmit }>
          { self.renderSections(form.sections) }
          <div className="actions">
            { type === 'insert' || !autosave ? <BlueFormInput className={ get(form, 'options.submitClassName') } text={ get(form, 'options.submitText') } type="submit" /> : null }
          </div>
        </form>
      );
    } else {
      let fieldKeys = keys(form.schema._schema);
      return (
        <form className="ui form" onSubmit={ this.onSubmit }>
          { self.renderFields(fieldKeys) }
          <div className="actions">
            { type === 'insert' || !autosave ? <BlueFormInput className={ get(form, 'options.submitClassName') } text={ get(form, 'options.submitText') } type="submit" /> : null }
          </div>
        </form>
      );
    }
  }
};

BlueForm.contextTypes = {
  data: React.PropTypes.object,
  formDoc: React.PropTypes.object,
}

BlueForm.childContextTypes = {
  autosave: React.PropTypes.bool,
  clearOnSuccess: React.PropTypes.bool,
  data: React.PropTypes.object,
  disabled: React.PropTypes.bool,
  disableOnSubmit: React.PropTypes.bool,
  errors: React.PropTypes.object,
  form: React.PropTypes.object,
  formDoc: React.PropTypes.object,
  inputOnChange: React.PropTypes.func,
  onSelectDate: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  selectOnChange: React.PropTypes.func,
  type: React.PropTypes.string
}

export default BlueForm;
