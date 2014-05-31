Termite.prototype = new Agent();
Termite.prototype.constructor = Termite;

function Termite() {
	Agent.call(this);
	this.typeId = "termite";
	this.boundingRadius = 3;
	this.perceptionRadius = 200;

	this.hasWood = false;

	this.collideTypes = ["wood_heap", "wall"];
	this.contactTypes = ["wood_heap", "wall"];

	this.heapInfos = [];
	this.wallInfos = [];
	this.directionDelay = 0;
	this.speed = 100;
	this.updateRandomDirection();
	
	this.worldDim = 600;
	this.gridDim = this.worldDim / this.boundingRadius;
	this.initGrid();
	this.astarGraph = null;
	var graph = new Graph([
				[1,1,1,1],
				[0,1,1,0],
				[0,0,1,1]
			]);
			var start = graph.nodes[0][0];
			var end = graph.nodes[1][2];
			var result = astar.search(graph.nodes, start, end);
			console.log(result[0]);
}

Termite.prototype.initGrid = function (){
	this.astarGrid = [this.gridDim];
	for(var i = 0; i < this.gridDim; i++){
		this.astarGrid[i] = [this.gridDim];
	}
	for(var i = 0; i < this.gridDim; i++){
		for(var j = 0; j < this.gridDim; j++){
			this.astarGrid[i][j] = 0;
		}
	}
}

Termite.prototype.stayInWorld = function (dim){
	if(dim < 0)
		dim = 0;
	else if(dim > this.worldDim - 1)
		dim = this.worldDim - 1;
	return dim;
}

Termite.prototype.pushWallInGridDim = function (wall){	
	for(var i = 0; i < 4; i++){
		if (i == 0) {
			for (var j = wall[i].x; j < wall[i+1].x; j++){
				this.astarGrid[parseInt((wall[i].x + j) / this.boundingRadius)][parseInt(wall[i].y / this.boundingRadius)] = 1;
			}
		}else if (i == 1) {
			for (var j = wall[i].y; j < wall[i+1].y; j++){
				this.astarGrid[parseInt(wall[i].x / this.boundingRadius)][parseInt((wall[i].y + j) / this.boundingRadius)] = 1;
			}
		}else if (i == 2) {
			for (var j = wall[i+1].x; j < wall[i].x; j++){
				this.astarGrid[parseInt((wall[i+1].x + j) / this.boundingRadius)][parseInt(wall[i].y / this.boundingRadius)] = 1;
			}
		}else if (i == 3) {
			for (var j = this.stayInWorld(wall[0].y); j < this.stayInWorld(wall[i].y); j++){
				this.astarGrid[parseInt(wall[i].x / this.boundingRadius)][parseInt((wall[0].y + j) / this.boundingRadius)] = 1;
			}
		}
	}
	this.astarGraph = new Graph(this.astarGrid);
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
	
	//this.setTarget(targetHeap.x, targetHeap.y);

	var x = this.x + this.direction.x * this.speed * dt / 1000;
	var y = this.y + this.direction.y * this.speed * dt / 1000;
	//this.moveTo(x,y);
};

Termite.prototype.iKnowThisWall = function (id){
	for(identifier in this.wallInfos) {
		if(identifier == id)
			return true;
	}
	return false;
}

Termite.prototype.draw = function(context) {
	context.fillStyle = this.hasWood ? "#f00" : "#000";
	context.strokeStyle = "#000";
	context.beginPath();
	context.arc(this.x,this.y,this.boundingRadius,0,2*Math.PI);
	context.fill();
	context.stroke();
};

Termite.prototype.processCollision = function(collidedAgent) {
	if(collidedAgent){
		if(collidedAgent.typeId == "wood_heap") {
			if(this.hasWood) {
				collidedAgent.addWood();
				this.hasWood = false;
			} else {
				collidedAgent.takeWood();
				this.hasWood = true;
			}
		}else if(collidedAgent.typeId == "wall") {		
			this.processPerceptionWall(collidedAgent);
		}
	}
};

Termite.prototype.processPerception = function(perceivedAgent) {
	if(perceivedAgent.typeId == "wood_heap") {		
		this.heapInfos[perceivedAgent.identifier] = {
			"x"		: perceivedAgent.x,
			"y"		: perceivedAgent.y,
			"count"	: perceivedAgent.woodCount,
			"date"	: Date.now()
		};
	}else if(perceivedAgent.typeId == "termite") {
		for(identifier in perceivedAgent.heapInfos) {
			var heapInfo = perceivedAgent.heapInfos[identifier];
			if(this.heapInfos[identifier] == null) {
				this.heapInfos[identifier] = heapInfo;
			}else if(heapInfo.count <= 0) {
				this.heapInfos[identifier] = heapInfo;
			} else if(this.heapInfos[identifier].date < heapInfo.date)
				this.heapInfos[identifier] = heapInfo;				
			
		}
		for(identifier in perceivedAgent.wallInfos) {
			var wallInfo = perceivedAgent.wallInfos[identifier];
			if(this.wallInfos[identifier] == null) {
				this.wallInfos[identifier] = wallInfo;
			}
		}
	}else if(perceivedAgent.typeId == "wall") {		
		this.processPerceptionWall(perceivedAgent);
	}
};

Termite.prototype.processPerceptionWall = function(agent){
	if(!this.iKnowThisWall(agent.identifier)){
		this.wallInfos[agent.identifier] = [
			{
				"x" : this.stayInWorld(agent.x - agent.boundingWidth / 2),
				"y" : this.stayInWorld(agent.y - agent.boundingHeight / 2)
			},
			{
				"x" : this.stayInWorld(agent.x + agent.boundingWidth / 2),
				"y" : this.stayInWorld(agent.y - agent.boundingHeight / 2)
			},
			{
				"x" : this.stayInWorld(agent.x + agent.boundingWidth / 2),
				"y" : this.stayInWorld(agent.y + agent.boundingHeight / 2)
			},
			{
				"x" : this.stayInWorld(agent.x - agent.boundingWidth / 2),
				"y" : this.stayInWorld(agent.y + agent.boundingHeight / 2)
			}
		];
		this.pushWallInGridDim(this.wallInfos[agent.identifier]);
	}
}
