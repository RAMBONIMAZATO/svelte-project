var save = {};

save.Application = Class.extend({
	Name : "save.Application",
	init : function()
	{
		this.view = new save.Canvas("canvas");
	}
})