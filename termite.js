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
	this.woodHeapPos = [];
	this.perceptionRadius = 20;
	this.woodHeapPosDate = 0;
}

Termite.prototype.changeDirection = function(){
	this.direction = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
	var minSpeed = 100;
	var maxSpeed = 200;
	this.speed = minSpeed  + Math.random() * (maxSpeed - minSpeed);
	
	var minDelay = 100;
	var maxDelay = 500;
	this.delay = minDelay  + Math.random() * (maxDelay - minDelay);
};

Termite.prototype.removeFromArray = function (array, indice) {
	var newarray = [];
	for(var i = 0; i < array.length; i++){
		if (i != indice) {
			newarray[newarray.length] = array[i];
		}
	}
	return newarray;
};

Termite.prototype.changeDirectionToBigWoodHeap = function(){
	var woodcount = 0;
	var big = {};
	for(var i = 0; i < this.woodHeapPos.length; i++){
		if (this.woodHeapPos[i].woodcount < 0) {
			this.woodHeapPos = this.removeFromArray(this.woodHeapPos, i);
		}
	}
	for(var i = 0; i < this.woodHeapPos.length; i++){
		if (woodcount < this.woodHeapPos[i].woodcount) {			
			woodcount = this.woodHeapPos[i].woodcount;
			big = this.woodHeapPos[i];
		}
	}
	this.direction = new Vect(big.x-this.x, big.y-this.y);
};

Termite.prototype.changeDirectionToLittleWoodHeap = function(){
	var woodcount = 1000000;
	var little = {};
	for(var i = 0; i < this.woodHeapPos.length; i++){
		if (this.woodHeapPos[i].woodcount < 0) {
			this.woodHeapPos = this.removeFromArray(this.woodHeapPos, i);
		}
	}
	for(var i = 0; i < this.woodHeapPos.length; i++){
		if (woodcount > this.woodHeapPos[i].woodcount) {
			little = this.woodHeapPos[i];
			woodcount = this.woodHeapPos[i].woodcount;
		}
	}
	this.direction = new Vect(little.x-this.x, little.y-this.y);
};

Termite.prototype.update = function(dt) {
	var distance = dt/1000*this.speed;
	this.direction.normalize(distance);
	this.x +=this.direction.x;
	this.y +=this.direction.y;
	this.delay -= dt;
	if (this.delay <= 0) {
		if (this.woodHeapPos.length > 1) {
			if (this.boutDeBois) {
				this.changeDirectionToBigWoodHeap();
			}else{
				this.changeDirectionToLittleWoodHeap();
			}
		}else{
			this.changeDirection();
		}
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

Termite.prototype.IKnowThisWoodHeap = function (id) {
	for(var i = 0; i < this.woodHeapPos.length; i++){
		if (id == this.woodHeapPos[i].id) {
			return true;
		}
	}
	return false;
};

Termite.prototype.updateWoodCount = function(woodcount, id) {
	for(var i = 0; i < this.woodHeapPos.length; i++){
		if (id == this.woodHeapPos[i].id) {
			this.woodHeapPos[i].woodcount = woodcount;
		}
	}
};

Termite.prototype.processCollision = function(collidedAgent) {
	if(collidedAgent && collidedAgent.typeId == "wood_heap") {
		if (this.boutDeBois) {
			collidedAgent.addWood();
			this.boutDeBois = false;
			if (this.woodHeapPos.length > 1) {
				this.changeDirectionToBigWoodHeap();
			}else{
				this.changeDirection();
			}
		}else{
			collidedAgent.takeWood();
			this.boutDeBois = true;
			if (!this.IKnowThisWoodHeap(collidedAgent.id)) {
				var obj = {	x:collidedAgent.x,
							y:collidedAgent.y,
							woodcount:collidedAgent.woodCount,
							id:collidedAgent.id};
				this.woodHeapPos[this.woodHeapPos.length] = obj;
				this.woodHeapPosDate = Date.now();
			}else{
				this.updateWoodCount(collidedAgent.woodCount, collidedAgent.id);
			}
			if (this.woodHeapPos.length > 1) {
				this.changeDirectionToLittleWoodHeap();
			}else{
				this.changeDirection();
			}			
		}		
	}
};

Termite.prototype.processPerception = function(perceivedAgent) {
	if (perceivedAgent && perceivedAgent.woodHeapPos) {
		if (this.woodHeapPosDate < perceivedAgent.woodHeapPosDate) {
			this.woodHeapPos = perceivedAgent.woodHeapPos;
			this.woodHeapPosDate = Date.now();
		}		
	}
};
