
/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/

/**
 * @class draw2d.command.CommandAdd
 * 
 * Command to add a figure with CommandStack support.
 * 
 * @extends draw2d.command.Command
 */
draw2d.command.CommandAdd = draw2d.command.Command.extend({

    NAME: "draw2d.command.CommandAdd",

    /**
     * @constructor
     * Create a add command for the given figure.
     * 
     * @param {draw2d.Canvas} canvas the canvas to use
     * @param {draw2d.Figure} figure the figure to add
     * @param {Number|draw2d.geo.Point} x the x-coordinate or a complete point where to place the figure
     * @param {Number} [y] the y-coordinate if x is a number and not a complete point
     */
    init: function(canvas, figure, x,y)
    {
       this._super(draw2d.Configuration.i18n.command.addShape);
       this.figure = figure;
       this.canvas = canvas;
       this.pos = new draw2d.geo.Point(x,y);
    },


    /**
     * @method
     * Returns [true] if the command can be execute and the execution of the
     * command modifies the model. e.g.: a CommandMove with [startX,startX] == [endX,endY] should
     * return false. The execution of this Command doesn't modify the model.
     *
     * @return {Boolean} return try if the command modify the model or make any relevant changes
     **/
    canExecute: function()
    {
        // we can only add the figure once to the canvas
        return this.figure.getCanvas()===null;
    },

    /**
     * @method
     * Execute the command the first time
     * 
     **/
    execute: function()
    {
       this.canvas.add(this.figure, this.pos.x, this.pos.y);
    },
    
    /** 
     * @method
     * Redo the command after the user has undo this command
     *
     **/
    redo: function()
    {
        this.execute();
    },
    
    /**
     * @method
     * Undo the command
     *
     **/
    undo: function()
    {
        this.canvas.remove(this.figure);
    }
    
});