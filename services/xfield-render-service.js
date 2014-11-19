'use strict';

angular.module('angular-xform.services').factory('XfieldRenderService', function($q, $interval, $timeout){

  function getStandardFieldTypes(){
    return [
      'textarea',
      'checkbox',
      'color',
      'date',
      'datetime',
      'datetime-local',
      'email',
      'file',
      'hidden',
      'month',
      'number',
      'password',
      'radio',
      'range',
      'reset',
      'search',
      'tel',
      'text',
      'time',
      'url',
      'week'
    ];
  }

  var XfieldRenderService = function(scope, xfieldData){
    this.scope = scope;
    this.xfieldData = xfieldData;
    this.xformConfig = this.scope.xformConfig;
  };

  XfieldRenderService.prototype.getWrapperClass = function(){
    var fieldWrapperClass = 'field-wrapper ';
    fieldWrapperClass += 'field-type-' + this.xfieldData.fieldType + ' ';

    if( this.xfieldData.fieldColumnSizeClass ){
      fieldWrapperClass += this.xfieldData.fieldColumnSizeClass;
    }
    else{
      fieldWrapperClass += 'col-xs-12';
    }

    return fieldWrapperClass;
  };

  XfieldRenderService.prototype.getClass = function(){
    var xfieldClass = 'form-control ';

    if( this.xfieldData.fieldSizeClass ){
      xfieldClass += this.xfieldData.fieldSizeClass;
    }
    else if( this.xformConfig.fieldsSizeClass ){
      xfieldClass += this.xformConfig.fieldsSizeClass;
    }

    return xfieldClass;
  };

  XfieldRenderService.prototype.getId = function(){
    var xfieldId;

    if( this.xfieldData.fieldId ){
      xfieldId = this.xfieldData.fieldId;
    }
    else{
      xfieldId = this.xfieldData.fieldName.replace('_', '-');
    }

    return xfieldId;
  };

  XfieldRenderService.prototype.getPlaceholder = function(){
    var xfieldPlaceholder = '';

    if( this.xfieldData.fieldPlaceholder ){
      xfieldPlaceholder = this.xfieldData.fieldPlaceholder;
    }

    return xfieldPlaceholder;
  };

  XfieldRenderService.prototype.getValue = function(){
    var xfieldValue = '';

    if( this.xfieldData.fieldValue ){
      xfieldValue = this.xfieldData.fieldValue;
    }

    return xfieldValue;
  };

  XfieldRenderService.prototype.getValidationAttributesHtml = function(){
    var xfieldRenderService = this,
        xfieldValidationAttributes = '';

    if( this.xfieldData.fieldValidationRules &&
      Object.prototype.toString
        .call( this.xfieldData.fieldValidationRules ) === '[object Array]'
    ){
      angular.forEach(this.xfieldData.fieldValidationRules, function(rule){
        if( rule.attrName && rule.attrValue ){
          xfieldValidationAttributes += rule.attrName + '="' +
                                  rule.attrValue + '" ';
        }

        if( rule.hideOnChange ){
          xfieldValidationAttributes += 'ng-change="form[\'' +
                                  xfieldRenderService.xfieldData.fieldName +
                                  '\'].$setValidity(\'' +
                                  rule.errorName +
                                  '\', true)" ';
        }
      });
    }

    return xfieldValidationAttributes;
  };

  XfieldRenderService.prototype.getValidationMessagesHtml = function(){
    var xfieldRenderService = this,
        xfieldValidationMessages = '';

    if( this.xfieldData.fieldValidationRules &&
      Object.prototype.toString
        .call( this.xfieldData.fieldValidationRules ) === '[object Array]'
    ){
      angular.forEach(this.xfieldData.fieldValidationRules, function(rule){
        if( rule.errorName && rule.errorMessage ){
          xfieldValidationMessages += '<p class="help-block" ng-show="form[\'' +
                                xfieldRenderService.xfieldData.fieldName +
                                '\'].$error[\'' +
                                rule.errorName +
                                '\'] && (!form[\'' +
                                xfieldRenderService.xfieldData.fieldName +
                                '\'].$pristine || submitted)"><span>' +
                                rule.errorMessage + '</span></p>';
        }
      });
    }

    return xfieldValidationMessages;
  };

  XfieldRenderService.prototype.getHtml = function(){
    var that = this,
        $scope = this.scope,
        xfieldData = this.xfieldData,
        beforeFieldHtml = '',
        fieldHtml = '',
        fieldValidationMessages = this.getValidationMessagesHtml(),
        afterFieldHtml = '',
        availableValuesPropertyName,
        availableValuesDeferred = $q.defer(),
        fieldHtmlDeferred = $q.defer(),
        getHtmlDeferred = $q.defer();

    // no need for wrapping html or label for hidden inputs and submit/button
    if( ['hidden', 'submit', 'button'].indexOf(xfieldData.fieldType) === -1 ){
      beforeFieldHtml += '<div class=" ' + this.getWrapperClass() +
                      '" id="' + this.getId() +'-field-wrapper" ' +
                      'ng-class="{ \'has-error\' : form[\'' +
                      xfieldData.fieldName + '\'].$invalid && (!form[\'' +
                      xfieldData.fieldName + '\'].$pristine || submitted) }">';

      beforeFieldHtml += '<label for="' + this.getId() + '-field">' +
                      xfieldData.fieldLabel + '</label>';

      afterFieldHtml += '</div>';
    }

    // standard <input> types + textarea
    if(getStandardFieldTypes().indexOf(xfieldData.fieldType) !== -1){
      if( xfieldData.fieldType === 'textarea' ){
        fieldHtml += '<textarea ';
      }
      else{
        fieldHtml += '<input type="' + xfieldData.fieldType + '" ';
      }

      fieldHtml += 'class="' + this.getClass() + '" ';
      fieldHtml += 'name="' + xfieldData.fieldName + '" ';
      fieldHtml += 'id="' + xfieldData.fieldId + '-field" ';
      fieldHtml += 'placeholder="' + that.getPlaceholder() + '" ';
      fieldHtml += 'ng-model="' + xfieldData.fieldModel + '" ';

      // we don't want to debounce model updates for radio and checkbox fields
      if( ['radio', 'checkbox'].indexOf(xfieldData.fieldType) === -1 ){
        fieldHtml += 'ng-model-options="{ updateOn: \'default blur\', ' +
                      'debounce: {\'default\': 1500, \'blur\': 500} }" ';
      }

      fieldHtml += this.getValidationAttributesHtml();

      if( xfieldData.fieldType === 'textarea' ){
        fieldHtml += '>' + this.getValue() + '</textarea>';
      }
      else{
        fieldHtml += ' value="' + this.getValue() + '" />';
      }

      fieldHtmlDeferred.resolve(fieldHtml);
    }

    // select type

    if( xfieldData.fieldType === 'select' ){
      if( typeof(xfieldData.fieldAvailableValues) === 'function' ){
        xfieldData.fieldAvailableValues().then(function(availableValues){
          availableValuesDeferred.resolve(availableValues);
        });
      }
      else{
        availableValuesDeferred.resolve(xfieldData.fieldAvailableValues);
      }

      availableValuesDeferred.promise.then(function(availableValues){
        if( availableValues.length > 0 ){
          if(
            xfieldData.fieldValueLabelPropertyName &&
            ! availableValues[0][xfieldData.fieldValueLabelPropertyName]
          ){
            throw new Error(
              'The fieldValueLabelPropertyName property for ' +
              xfieldData.fieldName + ' does not exist in the select values.' );
          }
        }

        availableValuesPropertyName = (xfieldData.fieldId + 'AvailableValues').split('-').join('_');

        $scope[availableValuesPropertyName] = availableValues;

        fieldHtml += '<ui-select ng-model="' + xfieldData.fieldModel + '">' +
                      '<ui-select-match ' +
                      'placeholder="' + that.getPlaceholder() + '">' +
                      '{{$select.selected[\'' + xfieldData.fieldValueLabelPropertyName + '\']}}</ui-select-match>' +
                      '<ui-select-choices repeat="item in ' + availableValuesPropertyName + ' | ' +
                      'filter: $select.search">' +
                      '<span ng-bind-html="item[\'' + xfieldData.fieldValueLabelPropertyName + '\'] | ' +
                      'highlight: $select.search"></span>' +
                      '</ui-select-choices></ui-select>';

        fieldHtmlDeferred.resolve(fieldHtml);
      });
    }

    // wysiwyg type
    if( xfieldData.fieldType === 'wysiwyg' ){
      fieldHtml += '<div text-angular ng-model="' + xfieldData.fieldModel + '"></div>';
      fieldHtmlDeferred.resolve(fieldHtml);
    }

    // button type
    if( ['button', 'submit'].indexOf(xfieldData.fieldType) !== -1 ){
      $scope.submitLabelDefault = xfieldData.buttonLabelDefault;
      $scope.submitLabelSubmitting = xfieldData.buttonLabelSubmitting;
      $scope.submitLabel = $scope.submitLabelDefault;

      $scope.$interval = $interval;

      $scope.$watch('submitInProgress', function(submitInProgress){
        if( submitInProgress === true ){
          $scope.submitLabel = $scope.submitLabelSubmitting;

          if($scope.submitLabel.slice(-3) === '...'){
            $scope.submitLabel = '<span class="with-dots">' +
                                  $scope.submitLabel
                                    .substr(0, $scope.submitLabel.length -3) +
                                    '<span class="dots"></span></span>';

            $scope.submitMessageDotsInterval = $interval(function(){
              var $message = $($scope.submitLabel),
                  dotsTxt = $message.find('.dots').text();

              if( dotsTxt.length < 3 ){
                dotsTxt = dotsTxt + '.';
              }
              else{
                dotsTxt = '.';
              }

              $message.find('.dots').html(dotsTxt);
              $message = $('<div class="mwrapper" />').append($message);

              $scope.submitLabel = $message.html();
            }, 400);
          }
        }
        else{
          if( $scope.submitMessageDotsInterval ){
            $interval.cancel($scope.submitMessageDotsInterval);
          }

          $timeout(function(){
            $scope.submitLabel = $scope.submitLabelDefault;
          });
        }
      });

      fieldHtml += '<button type="submit" class="btn btn-success" ' +
                    'ng-disabled="submitInProgress" ' +
                    'ng-bind-html="submitLabel"></button>';

      fieldHtmlDeferred.resolve(fieldHtml);
    }

    fieldHtmlDeferred.promise.then(function(fieldHtml){
      var getHtmlOutput = beforeFieldHtml + fieldHtml + fieldValidationMessages + afterFieldHtml;


      getHtmlDeferred.resolve(getHtmlOutput);
    });

    return getHtmlDeferred.promise;
  };

  return XfieldRenderService;
});