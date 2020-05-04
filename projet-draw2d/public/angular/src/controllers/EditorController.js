app.controller('EditorController', ['$scope', function($scope) {

    $scope.editor = {

            // Configuration of the editor
            canvas : {
                // callback if a DOM node from the palette is dropped inside the canvas
                onDrop: function(droppedDomNode, x, y, shiftKey, ctrlKey) {
                    const type = $(droppedDomNode).data('shape');
                    const figure = eval(`new ${type}({x:${x}, y:${y}})`);
                    // create a command for the undo/redo support
                    const command = new draw2d.command.CommandAdd(this, figure, x, y);
                    this.getCommandStack().execute(command);
                },
            },
 
            // providing all figures to show in the left hand palette
            // Used by the directives/canvas.js
            palette: {
                    figures: [
                        // {class: 'draw2d.shape.basic.Circle', name:'Circle'},
                        // {class: 'draw2d.shape.basic.Rectangle', name:'Rectangle'},
                        // {class: 'draw2d.shape.basic.PolyLine', name:'PLine'},
                        // {class: 'draw2d.shape.basic.Line', name: 'Line'},
                        {class: 'draw2d.shape.node.Start', name:'Start'},
                        {class: 'draw2d.shape.node.Between', name:'Between'},
                        {class: 'draw2d.shape.node.End', name:'End'},
                        {class: 'draw2d.shape.basic.Polygon', name:'Polygon'},
                    ]
            }
    };
}]);
