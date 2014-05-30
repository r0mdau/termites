Termite.prototype = new Agent();
Termite.prototype.constructor = Termite;

function Termite() {
	Agent.call(this);
	this.typeId = "termite";
	this.boundingRadius = 3;
	this.perceptionRadius = 100;

	this.hasWood = false;

	this.collideTypes = ["wood_heap", "wall"];
	this.contactTypes = ["wood_heap"];

	this.heapInfos = [];
	this.directionDelay = 0;
	this.speed = 500;
	this.updateRandomDirection();
}

Termite.prototype.updateRandomDirection = function(dt) {
	this.direction = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
	this.direction.normalize(1);
};
Termite.prototype.setTarget = function(x, y) {
	this.direction = new Vect(x - this.x, y - this.y);
	this.direction.normalize(1);
};

Termite.prototype.update = function(dt) {
	this.directionDelay -= dt;
	if(this.directionDelay <= 0) {
		var targetHeap = null;
		var searchTargetHeap = (Math.random() < 0.9)
		if(searchTargetHeap) {
			for(identifier in this.heapInfos) {
				var heapInfo = this.heapInfos[identifier];
				if(heapInfo.count > 0) {
					if(this.hasWood) {
						if(targetHeap == null || heapInfo.count > targetHeap.count) {
							targetHeap  = heapInfo;
						}
					} else if(!this.hasWood) {
						if(targetHeap == null || heapInfo.count < targetHeap.count) {
							targetHeap  = heapInfo;
						}			
					}
				}
			}
		}
		if(targetHeap) {
			this.setTarget(targetHeap.x, targetHeap.y);
		} else {
			this.updateRandomDirection();
		}
		this.speed = 100 + Math.random() * 200;
		this.directionDelay = 100 + Math.random() * 900;
	}

	var x = this.x + this.direction.x * this.speed * dt / 1000;
	var y = this.y + this.direction.y * this.speed * dt / 1000;
	this.moveTo(x,y);
};

Termite.prototype.draw = function(context) {
	context.fillStyle = this.hasWood ? "#f00" : "#000";
	context.strokeStyle = "#000";
	context.beginPath();
	context.arc(this.x,this.y,this.boundingRadius,0,2*Math.PI);
	context.fill();
	context.stroke();
};

Termite.prototype.processCollision = function(collidedAgent) {
	if(collidedAgent == null || collidedAgent.typeId == "wall") {
		this.directionDelay = 0;
	} else if(collidedAgent.typeId == "wood_heap") {
		if(this.hasWood) {
			collidedAgent.addWood();
			this.hasWood = false;
		} else {
			collidedAgent.takeWood();
			this.hasWood = true;
		}
	}
};

Termite.prototype.processPerception = function(perceivedAgent) {
	if(perceivedAgent.typeId == "wood_heap") {		
		this.heapInfos[perceivedAgent.identifier] = {
			"x":perceivedAgent.x,
			"y":perceivedAgent.y,
			"count": perceivedAgent.woodCount,
			"date" : Date.now()
		};
	} else if(perceivedAgent.typeId == "termite") {
		for(identifier in perceivedAgent.heapInfos) {
			var heapInfo = perceivedAgent.heapInfos[identifier];
			if(this.heapInfos[identifier] == null) {
				this.heapInfos[identifier] = heapInfo;
			}else if(heapInfo.count <= 0) {
				this.heapInfos[identifier] = heapInfo;
			} else if(this.heapInfos[identifier].date < heapInfo.date)
				this.heapInfos[identifier] = heapInfo;				
			
		}
	}else if(perceivedAgent.typeId == "wall") {
		console.log('I SEE A WALL');
	}
};
