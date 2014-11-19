'use strict';

angular.module('angular-xform.directives').directive('xfield', function($compile, $interval, $timeout, XfieldRenderService){
  return {
    restrict: 'E',
    require: '?^xform',
    controller: function($scope){

      $scope.getXfieldData = function(xformCtrl, xfieldAttrName, xfieldAttrValue){
        var xformFields, xfieldDataResult;

        if( $scope.xformFields ){
          xformFields = $scope.xformFields;
        }
        else if( xformCtrl ){
          xformFields = xformCtrl.getXFormFields();
        }
        else{
          throw new Error('Cannot find xform fields');
        }

        xformFields.filter(function(xfieldData){
          if( Object.prototype.toString.call(xfieldData) === '[object Array]'){
            xfieldData.filter(function(xfieldData){
              if ( xfieldData[xfieldAttrName] === xfieldAttrValue ){
                xfieldDataResult = xfieldData;
              }
            });
          }
          else{
            if ( xfieldData[xfieldAttrName] === xfieldAttrValue ){
              xfieldDataResult = xfieldData;
            }
          }
        });

        if( ! xfieldDataResult ){
          throw new Error('The ' + xfieldAttrValue +  ' field data could not be found.');
        }

        return xfieldDataResult;
      };
    },

    link : function(scope, element, attrs, xformCtrl){
      var xfieldData, xfieldRenderer, xfieldHtml;

      if( attrs.id ){
        xfieldData = scope.getXfieldData(xformCtrl, 'fieldId', attrs.id);
      }

      else if( attrs.name ){
        xfieldData = scope.getXfieldData(xformCtrl, 'fieldName', attrs.name);
      }

      xfieldRenderer = new XfieldRenderService(scope, xfieldData);

      xfieldRenderer.getHtml().then(function(xfieldHtml){
        element.replaceWith($compile(xfieldHtml)(scope));
      });
    }
  };
});




