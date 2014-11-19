// Fields data including field type, model property name, validation
// rules and validation errors. This is a dummy dataset so if the user
// doesn't add fieldsData (or any other config parameter) the xform will
// be in demo mode and it will show all the available fields

angular.module('angular-xform.data').value('xformDemoFields', [
  {
    fieldType: 'text',
    fieldName: 'text_field_example',
    fieldLabel: 'Text Field Example Label',
    fieldPlaceholder: 'Text Field Example Placeholder',
    fieldModel: 'textFieldExample',
    fieldValidations: [
      {
        rule: 'required',
        msg: 'This field is required'
      }
    ]
  },

  {
    fieldType: 'text',
    fieldName: 'another_text_field_example',
    fieldLabel: 'ANOTHER Text Field Example Label',
    fieldPlaceholder: 'Text Field Example Placeholder',
    fieldModel: 'textFieldExample',
    fieldValidations: [
      {
        rule: 'required',
        msg: 'This field is required'
      }
    ]
  }
]);