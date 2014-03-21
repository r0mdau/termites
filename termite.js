Termite.prototype = new Agent();
Termite.prototype.constructor = Termite;

function Termite() {
	Agent.call(this);
	this.typeId = "termite";
	this.boundingRadius = 2;
	this.changeDirection();
	this.collideTypes = ["wood_heap"];
	this.contactTypes = ["wood_heap"];
	this.boutDeBois = false;
}

Termite.prototype.changeDirection = function(){
	this.direction = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
	var minSpeed = 150;
	var maxSpeed = 300;
	this.speed = minSpeed  + Math.random() * (maxSpeed - minSpeed);
	
	var minDelay = 100;
	var maxDelay = 500;
	this.delay = minDelay  + Math.random() * (maxDelay - minDelay);
};

Termite.prototype.update = function(dt) {
	var distance = dt/1000*this.speed;
	this.direction.normalize(distance);
	this.x +=this.direction.x;
	this.y +=this.direction.y;
	this.delay -= dt;
	if (this.delay <= 0) {
		this.changeDirection();
	}
};

Termite.prototype.draw = function(context) {
	if (this.boutDeBois) {
		context.fillStyle = "#f00";
		context.strokeStyle = "#f00";
	} else {
		context.fillStyle = "#000";
		context.strokeStyle = "#000";
	}
	context.beginPath();
	context.arc(this.x,this.y,this.boundingRadius,0,2*Math.PI);
	context.fill();
	context.stroke();
};

Termite.prototype.processCollision = function(collidedAgent) {
	if(collidedAgent && collidedAgent.typeId == "wood_heap") {
		if (this.boutDeBois) {
			collidedAgent.addWood();
			this.boutDeBois = false;
		}else{
			collidedAgent.takeWood();
			this.boutDeBois = true;
		}
		this.changeDirection();
	}
};

Termite.prototype.processPerception = function(perceivedAgent) {
};
