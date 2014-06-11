Termite.prototype = new Agent();
Termite.prototype.constructor = Termite;

function Termite() {
	Agent.call(this);
	this.typeId = "termite";
	this.boundingRadius = 3;
	this.perceptionRadius = 100;

	this.hasWood = false;

	this.collideTypes = ["wood_heap", "wall"];
	this.contactTypes = ["wood_heap", "wall"];

	this.heapInfos = [];
	this.wallInfos = [];
	this.wall = null;	
	this.directionDelay = 0;
	this.speed = 200;
	this.updateRandomDirection();
	
	this.gridCaseDim = this.boundingRadius * 2;
	this.worldDim = 600;
	this.gridDim = parseInt(this.worldDim / this.gridCaseDim);
	this.initGrid();
	this.astarGraph = null;	
}

Termite.prototype.setRoad = function(x, y){
	this.road = [];
	var graph = new Graph(this.astarGrid);
    var start = graph.nodes[parseInt(parseInt(this.x) / this.gridCaseDim)][parseInt(parseInt(this.y) / this.gridCaseDim)];
    var end = graph.nodes[parseInt(parseInt(x) / this.gridCaseDim)][parseInt(parseInt(y) / this.gridCaseDim)];
    var result = astar.search(graph.nodes, start, end);
	for(var i = 0; i < result.length; i++){
		this.road.push(result[i]);
	}
};

Termite.prototype.initGrid = function (){
	this.astarGrid = [];
	for(var i = 0; i <= this.gridDim; i++){
		this.astarGrid[i] = [];
	}
	for(var i = 0; i <= this.gridDim; i++){
		for(var j = 0; j <= this.gridDim; j++){
			this.astarGrid[i][j] = 1;
		}
	}
};

Termite.prototype.pushWallInGridDim = function (wall){	
	for(var i = 0; i < 4; i++){		
		if (i == 0) {
			for (var j = 0; j < wall[i+1].x - wall[i].x; j++){				
				//console.log((wall[i].x + j) + ' ' + wall[i].y);
				this.astarGrid[parseInt((wall[i].x + j) / this.gridCaseDim)][parseInt(wall[i].y / this.gridCaseDim)] = 0;
			}
		}else if (i == 1) {
			for (var j = 0; j < wall[i+1].y - wall[i].y; j++){
				this.astarGrid[parseInt(wall[i].x / this.gridCaseDim)][parseInt((wall[i].y + j) / this.gridCaseDim)] = 0;
			}
		}else if (i == 2) {
			for (var j = 0; j < wall[i].x - wall[i+1].x; j++){
				this.astarGrid[parseInt((wall[i+1].x + j) / this.gridCaseDim)][parseInt(wall[i].y / this.gridCaseDim)] = 0;
			}
		}else if (i == 3) {
			for (var j = 0; j < wall[i].y - wall[0].y; j++){
				this.astarGrid[parseInt(wall[i].x / this.gridCaseDim)][parseInt((wall[0].y + j) / this.gridCaseDim)] = 0;
			}
		}
	}
	//this.astarGraph = new Graph(this.astarGrid);
};

Termite.prototype.updateRandomDirection = function(dt) {
	this.direction = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
	this.direction.normalize(1);
};
Termite.prototype.setTarget = function(x, y) {
	this.target = {x: x, y:y};
	this.direction = new Vect(x - this.x, y - this.y);
	this.direction.normalize(1);
};

Termite.prototype.perceive = function(){
	this.directionDelay -= dt;
	if(this.directionDelay <= 0) {
		var targetHeap = null;
		var searchTargetHeap = (Math.random() < 0.9);
		if(searchTargetHeap){
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
			this.setRoad(targetHeap.x, targetHeap.y);
		} else {			
			this.updateRandomDirection();
		}
		this.speed = 200 + Math.random() * 200;
		this.directionDelay = 1000 + Math.random() * 900;
	}
}

Termite.prototype.analyse = function(){
	if(this.road && this.road.length > 0){
		var nextPoint = this.road.shift();
		this.setTarget(nextPoint.x * this.gridCaseDim, nextPoint.y * this.gridCaseDim);			
	}
	
	var x = this.x + this.direction.x * this.speed * dt / 1000;
	var y = this.y + this.direction.y * this.speed * dt / 1000;
	return {x:x, y:y};
}

Termite.prototype.act = function (ccl){
	this.moveTo(ccl.x, ccl.y);
}

Termite.prototype.update = function(dt) {
	this.perceive();
	var conclusions = this.analyse();
	this.act(conclusions);
};

Termite.prototype.iKnowThisWall = function (id){
	for(identifier in this.wallInfos) {
		if(identifier == id)
			return true;
	}
	return false;
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
	if(collidedAgent){
		if(collidedAgent.typeId === "wall") {						
			this.processPerceptionWall(collidedAgent);
			this.directionDelay = 0;
		} else if(collidedAgent.typeId === "wood_heap") {			
			if(this.hasWood) {
				collidedAgent.addWood();
				this.hasWood = false;
			} else {
				collidedAgent.takeWood();
				this.hasWood = true;
			}			
			this.road = [];
			this.directionDelay = 0;
		}
	}
};

Termite.prototype.processPerception = function(perceivedAgent) {
	if(perceivedAgent.typeId === "wood_heap") {		
		this.heapInfos[perceivedAgent.identifier] = {
			"x"		: perceivedAgent.x,
			"y"		: perceivedAgent.y,
			"count"	: perceivedAgent.woodCount,
			"date"	: Date.now()
		};
	}else if(perceivedAgent.typeId === "termite") {
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
				this.processPerceptionWall(wallInfo);
			}
		}
	}else if(perceivedAgent.typeId === "wall") {
		for(identifier in this.wallInfos) {			
			if(this.wallInfos[perceivedAgent.identifier] == null) {
				this.wallInfos[perceivedAgent.identifier] = perceivedAgent;
				this.processPerceptionWall(perceivedAgent);
			}
		}
	}
};

Termite.prototype.processPerceptionWall = function(agent){
	//if(!this.iKnowThisWall(agent.identifier)){
		this.wallInfos[agent.identifier] = [
			{
				"x" : parseInt(agent.x - agent.boundingWidth / 2) - this.gridCaseDim,
				"y" : parseInt(agent.y - agent.boundingHeight / 2) - this.gridCaseDim
			},
			{
				"x" : parseInt(agent.x + agent.boundingWidth / 2) + this.gridCaseDim,
				"y" : parseInt(agent.y - agent.boundingHeight / 2) - this.gridCaseDim
			},
			{
				"x" : parseInt(agent.x + agent.boundingWidth / 2) + this.gridCaseDim,
				"y" : parseInt(agent.y + agent.boundingHeight / 2) + this.gridCaseDim
			},
			{
				"x" : parseInt(agent.x - agent.boundingWidth / 2) - this.gridCaseDim,
				"y" : parseInt(agent.y + agent.boundingHeight / 2) + this.gridCaseDim
			}
		];
		this.pushWallInGridDim(this.wallInfos[agent.identifier]);
	//}
};