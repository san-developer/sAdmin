(function () {
    var app = angular.module("App", ['ui.router', 'firebase', 'angularSpinner']);

    app.run(function ($rootScope, AppSvc, $firebase) {
        $rootScope.fireBaseUrl = 'https://crackling-fire-4674.firebaseio.com/';

        var refPhrases = new Firebase($rootScope.fireBaseUrl + 'phrases');

        var syncPhrases = $firebase(refPhrases);
        AppSvc.Phrases.Sync = syncPhrases;

        var Phrases = syncPhrases.$asArray();
        AppSvc.Loading = true;

        Phrases.$loaded().then(function (list) {
            AppSvc.Phrases.List = list;
            AppSvc.Loading = false;
        });
    });

    app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('/', {
            url: '/',
            controllerProvider: function ($stateParams, AppSvc) {
                if (!AppSvc.CurrentLang) {
                    AppSvc.CurrentLang = AppSvc.Languages.GetLangByAbbr('ge')
                }

                return "MainCtrl";
            }
        })
            .state('home', {
                url: '/:lang/home',
                controllerProvider: function ($stateParams, AppSvc) {
                    if ($stateParams.lang && $stateParams.lang.length == 2) {
                        AppSvc.CurrentLang = AppSvc.Languages.GetLangByAbbr($stateParams.lang);
                    }

                    if (!AppSvc.CurrentLang) {
                        AppSvc.CurrentLang = AppSvc.Languages.GetLangByAbbr('ge')
                    }

                    return "MainCtrl";
                }
            })
            .state('view', {
                url: '/:lang/:view',
                controllerProvider: function ($stateParams, AppSvc) {
                    if ($stateParams.lang && $stateParams.lang.length == 2) {
                        AppSvc.CurrentLang = AppSvc.Languages.GetLangByAbbr($stateParams.lang);
                    }

                    if (!AppSvc.CurrentLang) {
                        AppSvc.CurrentLang = AppSvc.Languages.GetLangByAbbr('ge')
                    }

                    return $stateParams.view.toLowerCase() + 'Ctrl';
                }
            })
    });

    app.controller("MainCtrl", ['$scope', '$timeout', '$stateParams', 'AppSvc', '$firebase', '$rootScope', '$window', function ($scope, $timeout, $stateParams, AppSvc, $firebase, $rootScope, $window) {
        $scope.AppSvc = AppSvc;
        $scope.ViewMode = { List: 1, Add: 2, Edit: 3 };
        $scope.View = $scope.ViewMode.List;

        $scope.PhraseObj = {};


        $scope.Save = function () {

            var valuesByLang = [];

            angular.forEach($scope.AppSvc.Languages.AvailableLanguages, function (lang) {
                valuesByLang.push({ LangID: lang.ID, Value: lang.PhraseValue })
            });


            $scope.AppSvc.Loading = true;


            $scope.PhraseObj.Values = valuesByLang;

            if ($scope.View == $scope.ViewMode.Add) {
                $scope.PhraseObj.ID = $scope.GetNewID(AppSvc.Phrases.List);
                $scope.AppSvc.Phrases.Sync.$set($scope.PhraseObj.ID, $scope.PhraseObj).then(function (ref) {
                    $scope.Phrase = '';
                    angular.forEach($scope.AppSvc.Languages.AvailableLanguages, function (lang) {
                        lang.PhraseValue = '';
                    });

                    $scope.AppSvc.Loading = false;
                    //$scope.EditMode($scope.PhraseObj);
                    $scope.Cancel();
                });
            }
            if ($scope.View == $scope.ViewMode.Edit) {
                $scope.AppSvc.Phrases.Sync.$update($scope.PhraseObj.ID, $scope.PhraseObj).then(function (ref) {
                    $scope.Phrase = '';
                    angular.forEach($scope.AppSvc.Languages.AvailableLanguages, function (lang) {
                        lang.PhraseValue = '';
                    });

                    $scope.AppSvc.Loading = false;
                    $scope.EditMode($scope.PhraseObj);
                });
            }
        }

        $scope.EditMode = function (phrase) {
            $scope.PhraseObj.Name = phrase.Name;
            $scope.PhraseObj.ID = phrase.ID;

            angular.forEach($scope.AppSvc.Languages.AvailableLanguages, function (l) {
                angular.forEach(phrase.Values, function (p) {
                    if (l.ID == p.LangID) { l.PhraseValue = p.Value; return; }
                });
            });

            $scope.View = $scope.ViewMode.Edit;

        }

        $scope.Update = function () {
            $scope.Save();
        }

        $scope.Delete = function (phrase) {
             $scope.AppSvc.Loading = true;
             $scope.AppSvc.Phrases.Sync.$remove(phrase.ID).then(function (ref) {
                $scope.AppSvc.Loading = false;
            });
        }
        $scope.Add = function () {
            $scope.View = $scope.ViewMode.Add;
        }


        $scope.GetNewID = function (collection) {
            var lastObj = _.last($scope.AppSvc.Phrases.List);
            return lastObj && lastObj.ID ? lastObj.ID + 1 : 1;
        }

        $scope.Cancel = function () {
            $scope.View = $scope.ViewMode.List;
            $scope.AppSvc.Loading = true;
            $window.location.reload();
        }
        
        

    }]);

})();