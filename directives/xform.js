'use strict';

angular.module('angular-xform.directives').directive('xform',
  function($q, $rootScope, $injector, $compile, xformDefaultConfig, xformDemoFields, XfieldRenderService){

  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {},
    controller: function($scope, $element){
      var ctrl = this;

      // methods exposed to nested transcluded directive 'xfield'
      this.getXFormConfig = function(){
        return $scope.xformConfig;
      };
      this.getXFormFields = function(){
        return $scope.xformFields;
      };

      $scope.getXFormFieldsHtml = function(){
        var getXFormFieldsHtmlDeferred = $q.defer(),
            xformFieldsHtml = ['<div class="fields-wrapper">'],
            xfieldsRowCounter = 0,
            singleHiddenFields = [];

        angular.forEach($scope.xformFields, function(xfieldData, i){
          var fieldsRowHtmlDeferred = $q.defer(),
              fieldsRowBefore = '',
              fieldsRowHtml = [],
              fieldsRowAfter = '',
              xfieldRenderer,
              xfieldArrCounter = 0,
              isSingleHiddenField = false;

          if( i > 0 ){
            xformFieldsHtml[i] = '';
          }

          // if this is NOT the last fields we need the .row wrapper
          if( i + 1 < $scope.xformFields.length ){
            fieldsRowBefore += '<div class="row">';
            fieldsRowAfter += '</div>'; // .row
          }

          // if this IS the last field it's a submit button, so we
          // must close .fields-wrapper before the button itself
          if( i + 1 === $scope.xformFields.length ){
            xformFieldsHtml[i] += '</div>'; // .fields-wrapper
          }

          // Array with multiple fields to print in a single fields row wrapper
          if( Object.prototype.toString.call(xfieldData) === '[object Array]' ){

            angular.forEach(xfieldData, function(xfieldItemData, i){
              var xfieldRenderer = new XfieldRenderService($scope, xfieldItemData);

              xfieldRenderer.getHtml().then(function(xfieldHtml){
                fieldsRowHtml[i] = xfieldHtml;
                xfieldArrCounter = xfieldArrCounter + 1;

                if( xfieldData.length === xfieldArrCounter ){
                  fieldsRowHtmlDeferred.resolve({
                    fieldsRowHtml: fieldsRowHtml.join(''),
                    isSingleHiddenField: isSingleHiddenField
                  });
                }
              });
            });
          }

          // Single field
          else if ( Object.prototype.toString.call(xfieldData) === '[object Object]' ){
            // override row settings if it's a single hidden field, i.e.
            // no row wrapping html needed
            if(xfieldData.fieldType === 'hidden'){
              fieldsRowBefore = '';
              fieldsRowAfter = '';
              isSingleHiddenField = true;
            }

            xfieldRenderer = new XfieldRenderService($scope, xfieldData);
            xfieldRenderer.getHtml().then(function(xfieldHtml){
              fieldsRowHtml[0] = xfieldHtml;

              fieldsRowHtmlDeferred.resolve({
                fieldsRowHtml: fieldsRowHtml.join(''),
                isSingleHiddenField: isSingleHiddenField
              });
            });
          }

          // Panic
          else{
            throw new Error('Unrecognized xfield data format.');
          }

          fieldsRowHtmlDeferred.promise.then(function(args){
            var fieldsRowHtmlOutput = fieldsRowBefore + args.fieldsRowHtml + fieldsRowAfter;

            if( args.isSingleHiddenField ){
              singleHiddenFields.push(fieldsRowHtmlOutput);
            }
            else{
              xformFieldsHtml[i] += fieldsRowHtmlOutput;
            }

            xfieldsRowCounter = xfieldsRowCounter + 1;

            if( $scope.xformFields.length === xfieldsRowCounter ){
              getXFormFieldsHtmlDeferred.resolve(
                singleHiddenFields.concat(xformFieldsHtml).join('')
              );
            }
          });
        });

        return getXFormFieldsHtmlDeferred.promise;
      };

      $scope.submitForm = function(){
        $scope.submitted = true;

        if( typeof($scope.xformConfig.beforeSubmit) === 'function' ){
          $scope.xformConfig.beforeSubmit($scope);
        }

        if( ! $scope.form.$valid ){
          return false;
        }

        $scope.submitInProgress = true;

        $scope.xformConfig.submit($scope).finally(function(){
          $scope.submitInProgress = false;

          if( typeof($scope.xformConfig.afterSubmit) === 'function' ){
            $scope.xformConfig.afterSubmit($scope);
          }
        });
      };

      $rootScope.$on('xform-submit', function(event, xformId){
        if( xformId === $scope.xformId ){
          $scope.submitForm();
        }
      });
    },

    compile : function compile(tElement, tAttrs, transclude){
      return {
        pre: function preLink(scope, iElement, iAttrs, controller, $transclude){
          var xformInstanceConfig = iAttrs.xconfig ? $injector.get(iAttrs.xconfig) : {},
              xformInstanceFields = iAttrs.xfields ? $injector.get(iAttrs.xfields) : null;

          scope.xformConfig = angular.extend({}, xformDefaultConfig, xformInstanceConfig);
          scope.xformFields = xformInstanceFields ? xformInstanceFields : xformDemoFields;

          // simple piece of data that might be needed by the form (like an ID)
          if( iAttrs.xdata ){
            iAttrs.$observe('xdata', function(newXdata, oldXdata){
              scope.xdata = newXdata;
            });
          }
            
          // model name and model value (for example used in forms editing an
          // existing object) to be set and kept up to date on scope
          if( iAttrs.xmodelName && iAttrs.xmodelValue ){
            iAttrs.$observe('xmodelValue', function(newXmodelValue, oldXmodelValue){
              scope[iAttrs.xmodelName] = $.extend({}, angular.fromJson(newXmodelValue));
            });
          }
        },
        post: function postLink(scope, iElement, iAttrs, controller, $transclude){
          scope.xformId = iAttrs.id ? iAttrs.id : 'xform';

          var formIdString = iAttrs.id ? 'id="' + iAttrs.id + '"' : '',
              xformDeferred = $q.defer(),
              xformHtmlBefore = '<form ' + formIdString + ' class="xform ' +
                            scope.xformConfig.formClass +'" name="form" ' +
                            'novalidate="true" ng-submit="submitForm()">',
              xformHtmlAfter = '</form>',
              xformHtmlOutput = '';
            
          if( scope.xformConfig.renderFields === true ){
            scope.getXFormFieldsHtml().then(function(xformHtml){
              var xformHtmlOutput = xformHtmlBefore + xformHtml + xformHtmlAfter;
              xformDeferred.resolve(xformHtmlOutput);
            });
          }
          else{
            xformHtmlOutput = xformHtmlBefore + xformHtmlAfter;
            xformDeferred.resolve(xformHtmlOutput);
          }

          xformDeferred.promise.then(function(xformHtmlOutput){
            $transclude(scope, function(clone) {
              iElement.replaceWith($compile(xformHtmlOutput)(scope).append(clone));
            });
          });
        }
      };
    }

  };

});