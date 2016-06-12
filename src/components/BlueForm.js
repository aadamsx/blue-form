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
    this.renderFields = this.renderFields.bind(this);
    this.renderSections = this.renderSections.bind(this);

    const { data = {}, schema, type = 'insert' } = this.props;
    let formDoc = {};
    if (type === 'update') {
      let schemaKeys = keys(schema._schema);
      formDoc = pick(data, schemaKeys);
    }
    this.state = {
      disabled: false,
      errors: {},
      formDoc: formDoc
    };
  }
  componentWillReceiveProps(nextProps) {
    const { data, schema, type = 'insert' } = nextProps;
    if (type === 'update') {
      this.setState({
        formDoc: data
      });
    }
  }
  getChildContext() {
    const { autosave, clearOnSuccess = true, data, disableOnSubmit = false, schema, type = 'insert' } = this.props;
    const { disabled, errors, formDoc } = this.state;
    let context = {
      autosave: autosave,
      clearOnSuccess: clearOnSuccess,
      disabled: disabled,
      disableOnSubmit: disableOnSubmit,
      formDoc: formDoc,
      errors: errors,
      inputOnChange: this.inputOnChange,
      onSelectDate: this.onSelectDate,
      onSubmit: this.onSubmit,
      schema: schema,
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

    if (date === '') {
      unset(formDoc, name);
    } else {
      set(formDoc, name, date);
    }

    this.setState({
      formDoc
    });

    this.validateInput();
  }
  inputOnChange(e) {
    let { autosave } = this.context;
    let { formDoc } = this.state;

    let name = e.target.getAttribute('name');
    let val = e.target.value;
    if (e.checkbox) {
      val = e.target.checked;
    }

    if (val === '') {
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

    this.validateInput();
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

    if (val === '' || val === '(Select One)') {
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

    this.validateInput();
  }
  validateInput() {
    let { schema } = this.props;
    let { formDoc } = this.state;
    let schemaContext = schema.newContext();
    let cleanDoc = this.cleanFormDoc(formDoc);
    let isValid = schemaContext.validate(cleanDoc);
    let errors = {};
    if (isValid) {
      this.setState({
        errors: errors
      });
    } else {
      let invalidKeys = schemaContext.invalidKeys();
      invalidKeys.forEach(function(key) {
        errors[key.name] = schemaContext.keyErrorMessage(key.name);
      });
      this.setState({
        errors: errors
      });
    }
  }
  cleanFormDoc(formDoc) {
    let cleanedDoc = {};
    const { schema } = this.props;
    /**
     * Use lodash _.set method to set value of nested properties
     */
    forOwn(formDoc, function(val, key) {
      if (schema._schemaKeys.indexOf(key) !== -1 && val !== '') {
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
    const { clearOnSuccess = true, disableOnSubmit = false, onError, schema, submit, type = 'insert' } = this.props;
    const { disabled, formDoc } = this.state;
    let schemaContext = schema.newContext();
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
  renderFields(fields) {
    const { schema } = this.props;

    let renderedFields = fields.map((key, i) => {
      let schemaObj = schema._schema[key];
      if (get(schemaObj, 'blueform.conditional')) {
        return (
          <BlueFormIf key={ i } condition={ get(schemaObj, 'blueform.conditional.condition') } data={ get(schemaObj, 'blueform.conditional.data') } property={ get(schemaObj, 'blueform.conditional.property') } value={ get(schemaObj, 'blueform.conditional.value') }>
            <BlueFormInput name={ key } />
          </BlueFormIf>
        );
      } else {
        return <BlueFormInput key={ i } name={ key } />;
      }
    });
    return renderedFields;
  }
  renderSections(sections) {
    const { schema } = this.props;
    let self = this;
    /**
     * Make sure section fields exist in schema
     */
    let schemaKeys = keys(schema._schema);
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (!includes(schemaKeys, field)) {
          throw new Error(`Section field ${field} does not exist in schema`);
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
    const { autosave, children, schema, sections, type } = this.props;
    const { errors, formDoc } = this.state;
    const self = this;
    if (!!children) {
      return (
        <form className="ui form" onSubmit={ this.onSubmit }>
        { children }
        </form>
      );
    } else if (!!sections) {
      return (
        <form className="ui form" onSubmit={ this.onSubmit }>
          { self.renderSections(sections) }
          { type === 'insert' || !autosave ? <BlueFormInput type="submit" /> : null }
        </form>
      );
    } else {
      let fieldKeys = keys(schema._schema);
      return (
        <form className="ui form" onSubmit={ this.onSubmit }>
          { self.renderFields(fieldKeys) }
          { type === 'insert' || !autosave ? <BlueFormInput type="submit" /> : null }
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
  formDoc: React.PropTypes.object,
  inputOnChange: React.PropTypes.func,
  onSelectDate: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  schema: React.PropTypes.object,
  selectOnChange: React.PropTypes.func,
  type: React.PropTypes.string
}

export default BlueForm;
