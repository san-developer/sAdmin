/**
 * angular-spinner version 0.5.0
 * License: MIT.
 * Copyright (C) 2013, 2014, Uri Shaked and contributors.
 */

(function (root) {
    'use strict';

    function factory(angular, Spinner) {

        angular
			.module('angularSpinner', [])

			.factory('usSpinnerService', ['$rootScope', function ($rootScope) {
			    var config = {};

			    config.spin = function (key) {
			        $rootScope.$broadcast('us-spinner:spin', key);
			    };

			    config.stop = function (key) {
			        $rootScope.$broadcast('us-spinner:stop', key);
			    };

			    return config;
			}])

			.directive('usSpinner', ['$window', function ($window) {
			    return {
			        scope: { spinnerStartActive: "=" },
			        link: function (scope, element, attr) {
			            var SpinnerConstructor = Spinner || $window.Spinner;

			            scope.spinner = null;

			            scope.key = angular.isDefined(attr.spinnerKey) ? attr.spinnerKey : false;

			            scope.startActive = angular.isDefined(scope.spinnerStartActive) ?
							String(scope.spinnerStartActive).toLowerCase() == "true" : scope.key ?
							false : true;

			            scope.spin = function () {
			                if (scope.spinner) {
			                    $(element).nextAll().hide()
			                    scope.spinner.spin(element[0]);

			                }
			            };

			            scope.stop = function () {
			                if (scope.spinner) {
			                    scope.spinner.stop();
			                    $(element).nextAll().show()
			                }
			            };

			            scope.$watch(attr.usSpinner, function (options) {
			                scope.stop();
			                scope.spinner = new SpinnerConstructor(options);
			                if (!scope.key || scope.startActive) {
			                    scope.spinner.spin(element[0]);
			                }
			            }, true);

			            scope.$watch('spinnerStartActive', function (options) {
			                angular.isDefined(scope.spinnerStartActive) &&
							String(scope.spinnerStartActive).toLowerCase() == "true" ? scope.spin() : scope.stop();
			            }, true);

			            scope.$on('us-spinner:spin', function (event, key) {
			                if (key === scope.key) {
			                    scope.spin();
			                }
			            });

			            scope.$on('us-spinner:stop', function (event, key) {
			                if (key === scope.key) {
			                    scope.stop();
			                }
			            });

			            scope.$on('$destroy', function () {
			                scope.stop();
			                scope.spinner = null;
			            });


			            if (scope.startActive) {

			                $(element).nextAll().hide()
			            }

			        }
			    };
			}]);
    }

    if (typeof define === 'function' && define.amd) {
        /* AMD module */
        define(['angular', 'spin'], factory);
    } else {
        /* Browser global */
        factory(root.angular);
    }
}(window));

