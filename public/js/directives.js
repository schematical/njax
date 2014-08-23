
angular.module('njax.directives', [])
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
            },
            //template: '/njax/templates/directives/njaxNamespace.html',
            /*controller: function($scope) {
                console.log('Target:', $scope.xtarget, $scope.target);
                //$scope.skills = skills;
                //$scope.selectedSkill = 'Bond';
            }*/

        };
    }]);