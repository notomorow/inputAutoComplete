angular.module('inputangucomplete', [])
    .directive('inputAutoComplete', function ($timeout) {
        var KEY_EN = 13;
        var KEY_UP = 38;
        var KEY_DOWN = 40;

        function keyDownEvent(scope, element, keyCode) {
            if (keyCode != KEY_EN) {
                scope.isShowDropList = true;
            }

            if (keyCode == KEY_EN && scope.isShowDropList) {
                element.find('input').val(scope.rendData[scope.currentIndex].name);
                scope.searchStr = scope.rendData[scope.currentIndex].name;
                scope.isShowDropList = false;
                scope.selectedFunc({ value: { valid: true, selectObj: scope.rendData[scope.currentIndex] } });
                return;
            }


            if (keyCode == KEY_DOWN) {
                if (scope.currentIndex < scope.rendData.length - 1) {
                    scope.currentIndex++;
                }
                return;
            }
            if (keyCode == KEY_UP) {
                if (scope.currentIndex > 0) {
                    scope.currentIndex--;
                }
                return;
            }

        }
        return {
            restrict: "AE",
            scope: {
                initFn: '&',
                selectClass: '=?',
                localData: '=?',
                searchFields: '@',
                autoMatch: '=?',
                minLength: '=?',
                maxLength: '=?',
                matchLength: '=?',
                disable: '=?',
                widthStyle: '=?',
                selectedFunc: '&selectedFunc',
                outTime: '=?',
            },
            template: "<div ng-init='init()' class='auto-complete-style'><input  type='text' ng-disabled='disable' " +
            "autocomplete='off' ng-style='widthStyle' ng-blur='blurFn()' ng-keydown='keydownFn($event)'  " +
            "ng-change='changeFn()' ng-model='searchStr'/><div class='angucomplete-dropdown'" +
            "ng-show='searchStr&&isShowDropList' style='top:23px' ><div ng-click='clickFn(data)' " +
            "ng-mouseover='overFn($index)' ng-repeat='data in rendData track by $index'" +
            " ng-class='{true: selectClass[0]+\" \"+selectClass[1], false: selectClass[0]}[$index==currentIndex]'>" +
            "<div>{{data.name}}</div></div></div></div>",
            controller: function ($scope) {
                $scope.init = function () {
                    $scope.initFn({ scope: $scope });
                }
            },
            link: function (scope, element, attrs, ctrl) {
                scope.rendData = [];
                scope.searchFields = scope.searchFields ? scope.searchFields : 'name,';
                scope.isShowDropList = false;
                scope.currentIndex = 0;
                scope.matchLength = scope.matchLength ? scope.matchLength : 10;
                scope.outTime = scope.outTime ? scope.outTime : 100;
                var searchTimer;

                scope.overFn = function (index) {
                    scope.currentIndex = index;
                }

                scope.changeFn = function () {
                    scope.currentIndex = 0;
                    if (searchTimer) {
                        $timeout.cancel(searchTimer);
                    }
                    searchTimer = $timeout(function () {
                        var rendData = [];
                        var searchFields = scope.searchFields.split(',')

                        for (var i = 0; i < scope.localData.length; i++) {
                            if (!scope.searchStr.length < scope.minLength || rendData.length > scope.matchLength - 1) break;
                            for (var j = 0; j < searchFields.length; j++) {
                                if (scope.localData[i][searchFields[j]] && scope.localData[i][searchFields[j]].indexOf(scope.searchStr) > -1) {
                                    rendData[rendData.length] = scope.localData[i];
                                    break;
                                }
                            }
                        }
                        scope.rendData = rendData;
                        scope.isShowDropList = scope.rendData.length > 0;
                        if (rendData.length === 1 && scope.autoMatch) {
                            for (var i = 0; i < searchFields.length; i++) {
                                if (rendData[0][searchFields[i]] === scope.searchStr) {
                                    keyDownEvent(scope, element, KEY_EN);
                                    return;
                                }
                            }

                        }
                        scope.selectedFunc({ value: { valid: false, str: scope.searchStr } });
                    }, scope.outTime);

                }
                scope.keydownFn = function (event) {
                    if ([KEY_EN, KEY_EN, KEY_UP].indexOf(event.keyCode) > -1) {
                        event.preventDefault();
                    }
                    keyDownEvent(scope, element, event.keyCode);

                }
                scope.blurFn = function () {
                    $timeout(function () {
                        scope.isShowDropList = false;
                    }, 100);

                }
                scope.clickFn = function (data) {
                    scope.searchStr = data.name;
                    element.find('input').val(data.name);
                    scope.selectedFunc({ value: { valid: true, selectObj: data } });
                }

            }
        }
    });