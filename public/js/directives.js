
angular.module('njax.directives', [])
    .directive('njaxIframe', [ function() {
        return {
            replace:true,
            scope:{
                //xtarget:'='
            },
            link:function(scope, element, attrs) {
                setTimeout(function(){
                    setInterval( function(){
                        var childHeight = element[0].contentWindow.document.body.offsetHeight;
                        element.css('height', childHeight);
                    }, 1000);
                    var jBody = $(element[0].contentWindow.document.body);
                    jBody.find('#njax-payload').val(JSON.stringify(window.njax_bootstrap));
                    jBody.find('#njax-iframe-form').submit();
                }, 1000);
            }

        };
    }])
    .directive('njaxNamespace', [ function() {

        return {
            replace:true,
            scope:{
               //xtarget:'='
            },
            link:function(scope, element, attrs) {
                //element.val('test');
                var target = angular.element(document.querySelector( '#' + attrs.njaxNamespace));
                target.on('keyup', function(event) {
                    var namespace = target.val()
                    namespace = namespace.toLowerCase();
                    namespace = namespace.replace(/[^\w\s]/gi, '');
                    namespace = namespace.replace(/ /g,"_");
                    element.val(namespace);

                });
            }
            //template: '/njax/templates/directives/njaxNamespace.html',
            /*controller: function($scope) {
                console.log('Target:', $scope.xtarget, $scope.target);
                //$scope.skills = skills;
                //$scope.selectedSkill = 'Bond';
            }*/

        };
    }]).directive('njaxEditable', [ function() {

        return {
            replace:true,
            scope:{


                //
            },
            templateUrl: '/njax/templates/directives/njaxEditable.html',
            link:function(scope, element, attrs) {
                //element.val('test');
                /*scope.popover = {
                    "title": "Title",
                    "content": "Tacos<br />This is a multiline message!",
                    "html":true,
                    "trigger":"hover"
                };*/
               /* var target = angular.element(document.querySelector( '#' + attrs.njaxNamespace));
                target.on('mouseover', function(event) {
                    var namespace = target.val()
                    namespace = namespace.toLowerCase();
                    namespace = namespace.replace(/[^\w\s]/gi, '');
                    namespace = namespace.replace(/ /g,"_");
                    element.val(namespace);

                });*/
            }
        };
    }]);;