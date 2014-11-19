'use strict';

angular.module('angular-xform.directives').directive('match',function(){
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope,element,attrs,ctrl){
      ctrl.$parsers.unshift(function(viewValue){
        var origin = scope.$eval(attrs.match);

        if( origin !== '' && viewValue !== '' && origin !== viewValue ){
          ctrl.$setValidity('match', false);
          return undefined;
        }
        else{
          ctrl.$setValidity('match', true);
          return viewValue;
        }
      });
    }
  };
});