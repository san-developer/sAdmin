var app = angular.module("App");

app.factory("AppSvc", ['$location', '$stateParams', '$firebase', '$rootScope', function ($location, $stateParams, $firebase, $rootScope) {
    var Languages = function () {
        this.AvailableLanguages = [];
    }

    var Phrases = function () {
        this.List = [];
        this.Sync = {};
    }


    var Language = function (id, abbr) {
        this.Abbreviature = abbr;
        this.ID = id;
    }
    Languages.prototype.GetLangByAbbr = function (abbr) {
        return this.AvailableLanguages.length > 0 ? _.find(this.AvailableLanguages, function (item) { return item.Abbreviature == abbr }) : null;
    }
    var Languages = new Languages();
    Languages.AvailableLanguages.push(new Language(1, 'ge'));
    Languages.AvailableLanguages.push(new Language(2, 'en'));

    var currentLang = Languages.GetLangByAbbr($stateParams.lang);
    return {
        Languages: Languages,
        CurrentLang: null,
        RedirectToRoute: function (route) {
            $location.url(this.CurrentLang.Abbreviature + '/' + route)
        },
        Phrases: {},
        Loading : false

    }
}])
;