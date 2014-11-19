'use strict';

angular.module('angular-xform.data').factory('xformDefaultConfig', function($q, $timeout){
  return {

    // fully isolated scope by default
    scope: {},

    // When true, xform reads the fieldsData and automatically outputs
    // the fields html. When false, you have to use the 'xfield' directive
    // to print each field within the xform
    renderFields: true,

    formClass: '',
    
    fieldsSizeClass: '',

    // This would always be replaced by a custom submit function
    // in the xform custom config. The submit needs to return a promise.
    submit: function(scope){
      var deferred = $q.defer();
      alert('Submit xform default action (overwrite me!)');

      $timeout(function(){
        deferred.resolve();
      }, 3000);

      return deferred.promise;
    }
  };
});