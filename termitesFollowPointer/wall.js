Wall.prototype = new Agent();
Wall.prototype.constructor = Wall;

function Wall() {
	Agent.call(this);
	this.typeId = "wall";
	if(Math.random() < 0.5) {
		this.boundingWidth = 100 + Math.random() * 400;
		this.boundingHeight = 20;
	} else {
		this.boundingHeight = 100 + Math.random() * 400;
		this.boundingWidth = 20;		
	}
}

Wall.prototype.update = function(dt) {
	
};

Wall.prototype.draw = function(context) {
	context.fillStyle = "rgba(255,255,255,0.5)";
	context.strokeStyle = "#000";
	context.beginPath();
	context.rect(this.x - this.boundingWidth/2, this.y - this.boundingHeight/2, this.boundingWidth, this.boundingHeight);
	context.fill();
	context.stroke();
};