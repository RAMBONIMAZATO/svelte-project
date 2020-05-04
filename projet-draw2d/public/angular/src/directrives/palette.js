d2.directive('draw2dPalette',  ['$window', '$parse', '$timeout', ($window, $parse, $timeout) => {
   return {
		   restrict: 'E,A',
           link: function(scope, element, attrs, controller) {

               // $timeout is used just to ensure that the template is rendered if we want access them
               $timeout(() => {
                   $('.draw2d_droppable').draggable({
                       appendTo: 'body',
                       stack: 'body',
                       zIndex: 27000,
                       helper: 'clone',
                       drag: (event, ui) => {
                       },
                       stop: (e, ui) => {
                       },
                       start: (e, ui) => {
                           $(ui.helper).addClass('shadow');
                       }
                  });
               }, 0);
    	   },
    	   template:"<div ng-repeat='figure in editor.palette.figures' data-shape='{{figure.class}}'  class='palette_node_element draw2d_droppable'>{{figure.name}}</div>"
   };
}]);