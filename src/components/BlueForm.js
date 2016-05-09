import React from 'react';
import BlueFormErrors from 'components/BlueFormErrors.js';

import assignIn from 'lodash/assignIn';
import forOwn from 'lodash/forOwn';
import keys from 'lodash/keys';
import set from 'lodash/set';
import throttle from 'lodash/throttle';
import unset from 'lodash/unset';

class BlueForm extends React.Component {
  constructor(props) {
    super(props);
    this.inputOnChange = this.inputOnChange.bind(this);
    this.selectOnChange = this.selectOnChange.bind(this);
    this.cleanFormDoc = this.cleanFormDoc.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    const { data = {}, schema, type = 'insert' } = this.props;
    let formDoc = {};
    if (type === 'update') {
      formDoc = data;
    }
    this.state = {
      context: schema.newContext(),
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
  inputOnChange(e) {
    let { formDoc } = this.state;

    let name = e.target.getAttribute('name');
    let val = e.target.value;

    if (val === '') {
      unset(formDoc, name);
    } else {
      set(formDoc, name, val);
    }

    this.setState({
      formDoc
    });
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
    const { context, disabled, formDoc } = this.state;
    let cleanDoc = this.cleanFormDoc(formDoc);
    let isValid = context.validate(cleanDoc);

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
      let invalidKeys = context.invalidKeys();
      let errors = {};
      invalidKeys.forEach(function(key) {
        errors[key.name] = context.keyErrorMessage(key.name);
      });
      this.setState({
        errors: errors
      });
      if (onError) {
        onError(errors);
      }
    }
  }
  render() {
    const { children } = this.props;
    const { errors } = this.state;
    return (
      <div>
        { keys(errors).length > 0 ? <BlueFormErrors errors={ errors } /> : '' }
        <form className="ui form" onSubmit={ this.onSubmit }>
          { children }
        </form>
      </div>
    );
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
  onSubmit: React.PropTypes.func,
  schema: React.PropTypes.object,
  selectOnChange: React.PropTypes.func,
  type: React.PropTypes.string
}

export default BlueForm;
