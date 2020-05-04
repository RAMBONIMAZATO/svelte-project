const app = angular.module('MyFirstDrawApp', ["draw2d", 'ui.bootstrap']);

app.controller('myctrl', function($scope, $rootScope) {

    $scope.click = () => {
        $rootScope.$broadcast('reset', {});
    };
    $scope.undo = () => {
        $rootScope.$broadcast('undo', {});
    };
    $scope.redo = () => {
        $rootScope.$broadcast('redo', {});
    }
});

app.directive("drawing", function(){

    return {
        restrict: "A",
        link: function(scope, element){

            let parent = [];
            let redoParent = [];
            let stack=[];

            let ctx = element[0].getContext('2d');

            // variable that decides if something should be drawn on mousemove
            let drawing = false;

            // the last coordinates before the current move
            let lastX;
            let lastY;
            scope.$on('reset', (event, data) => {
                scope.reset();
            });

            element.bind('mousedown', (event) => {
                if(event.offsetX!==undefined){
                    lastX = event.offsetX;
                    lastY = event.offsetY;
                } else {
                    lastX = event.layerX - event.currentTarget.offsetLeft;
                    lastY = event.layerY - event.currentTarget.offsetTop;
                }

                stack = [];
                // begins new line
                ctx.beginPath();
                drawing = true;
            });

            element.bind('mousemove', (event) => {
                if(drawing){
                    let currentX;
                    let currentY;

                    // get current mouse position
                    if (event.offsetX !== undefined) {
                        currentX = event.offsetX;
                        currentY = event.offsetY;
                    } else {
                        currentX = event.layerX - event.currentTarget.offsetLeft;
                        currentY = event.layerY - event.currentTarget.offsetTop;
                    }

                    stack.push({lastX, lastY, currentX, currentY});
                    draw(lastX, lastY, currentX, currentY);

                    // set current coordinates to last one
                    lastX = currentX;
                    lastY = currentY;
                }

            });

            element.bind('mouseup', (event) => {
                // stop drawing
                drawing = false;
                parent.push(stack);
            });

            // canvas reset
            scope.reset = function() {
                //parent = [];
                for(let i=0; i<parent.length; i++) {
                    parent.pop();
                }
                redoParent = [];
                stack=[];

                // reset the screen
                element[0].width = element[0].width;
            };

            scope.undo = function(event) {

                // reset the screen
                element[0].width = element[0].width;

                if (parent.length > 0) {
                    redoParent.push(parent.splice(-1, 1));
                    for (let j = 0; j < parent.length; j++) {
                        ctx.beginPath();
                        let s = parent[j];
                        for (let i = 0; i < s.length; i++) {
                            draw(s[i].lastX, s[i].lastY, s[i].currentX, s[i].currentY);
                        }
                    }
                }
            };

            scope.redo = function(event) {

                if (redoParent.length > 0) {
                    parent.push(redoParent.pop()[0]);
                    // reset the screen
                    element[0].width = element[0].width;
                    // re-draw
                    for (let j = 0; j < parent.length; j++) {
                        ctx.beginPath();
                        let s = parent[j];
                        for (let i = 0; i < s.length; i++) {
                            draw(s[i].lastX, s[i].lastY, s[i].currentX, s[i].currentY);
                        }
                    }
                }
            };

            function draw(lX, lY, cX, cY) {
                // line from
                ctx.moveTo(lX,lY);
                // to
                ctx.lineTo(cX,cY);
                // color
                ctx.strokeStyle = "#4bf";
                ctx.lineWidth=2;
                // draw it
                ctx.stroke();
            }
        }
    };
});