WoodHeap.prototype = Agent.prototype;
WoodHeap.prototype.constructor = WoodHeap;

function WoodHeap() {
	Agent.call(this);
	this.typeId = "wood_heap";
	this.woodCount = Math.random() * 50 + 10;
	this.contactTypes = ["wood_heap"];
}

WoodHeap.prototype.updateRadius = function() {
	this.boundingRadius = this.woodCount;
};

WoodHeap.prototype.update = function(dt) {
	this.updateRadius();
};

WoodHeap.prototype.addWood = function() {
	this.woodCount++;
};

WoodHeap.prototype.takeWood = function() {
	this.woodCount--;
	if(this.woodCount <= 0) {
		this.dead = true;
	}
};

WoodHeap.prototype.draw = function(context) {
	context.fillStyle="rgba(255, 255, 255, 0.5)";
	context.strokeStyle="#000";
	context.beginPath();
	context.arc(this.x,this.y,this.boundingRadius,0,2*Math.PI);
	context.fill();
	context.stroke();
};

WoodHeap.prototype.processCollision = function(collidedAgent) {
	if(collidedAgent && collidedAgent.typeId == "wood_heap") {
		if(this.woodCount > collidedAgent.woodCount) {
			collidedAgent.takeWood();
			this.addWood();
		}
	}
};