function WorldDNA(world) {
	this.worldWidth = world.width;
	this.worldHeight = world.height;
	this.positionsByTypes = {};
	this.fitting = Number.INT_MAX;
	for(var i = 0; i < world.agents.length; i++) {
		var agent = world.agents[i];
		if(!this.positionsByTypes[agent.typeId]) {
			this.positionsByTypes[agent.typeId] = [];
		}
		this.positionsByTypes[agent.typeId].push({x:0, y:0});
	}
}

WorldDNA.prototype.copy = function(worldDNA) {
	for(typeId in this.positionsByTypes) {
		var positions = this.positionsByTypes[typeId];
		var transferedPositions = worldDNA.positionsByTypes[typeId];

		for(var i = 0; i < positions.length; i++) {
			positions[i].x = transferedPositions[i].x;
			positions[i].y = transferedPositions[i].y;
		}		
	}	
};

WorldDNA.prototype.randomize = function() {
	for(typeId in this.positionsByTypes) {
		var positions = this.positionsByTypes[typeId];

		for(var i = 0; i < positions.length; i++) {
			positions[i].x = Math.random() * this.worldWidth;
			positions[i].y = Math.random() * this.worldHeight;
		};
	}
};

WorldDNA.prototype.mutate = function() {
	var ratio = Math.random() * 0.05 + 0.15; 
	for(typeId in this.positionsByTypes) {
		var positions = this.positionsByTypes[typeId];
		var mutatedCount = Math.floor(positions.length * ratio);
		for(var i = 0; i < mutatedCount; i++) {
			var randomIndex = Math.floor(Math.random() * (positions.length - 0.1));
			positions[randomIndex].x += Math.random() * 10 - 5;
			positions[randomIndex].y += Math.random() * 10 - 5;
		}
	}
};

WorldDNA.prototype.crossOver = function(worldDNA) {
	var ratio = Math.random() * 0.3 + 0.4; 

	for(typeId in this.positionsByTypes) {
		var positions = this.positionsByTypes[typeId];
		var transferedPositions = worldDNA.positionsByTypes[typeId];

		var transferedCount = Math.floor(positions.length * ratio);
		for(var i = 0; i < transferedCount; i++) {
			positions[i].x = transferedPositions[i].x;
			positions[i].y = transferedPositions[i].y;
		}		
	}	
};

//-------------------------------------

function WorldSolver (world) {
	this.world = world;

	this.agentsByTypes = {};
	for(var i = 0; i < world.agents.length; i++) {
		var agent = world.agents[i];
		if(!this.agentsByTypes[agent.typeId]) {
			this.agentsByTypes[agent.typeId] = [];
		}
		this.agentsByTypes[agent.typeId].push(agent);
	}

	this.populationCount = 100;
	this.population = [];
}

WorldSolver.prototype.solve = function() {
	this.initialize(this.populationCount);
	this.evaluate();
	var bestDNA = this.population[0];
	var bestFitting = this.processFitting(bestDNA);

	var maxGenerations = 200;
	while(bestFitting > 0 && maxGenerations > 0) {
		var selection = this.selectBest();
		this.nextGeneration(selection);
		this.evaluate();
		bestDNA = this.population[0];
		bestFitting = this.processFitting(bestDNA);
		maxGenerations--;
	}

	this.applyDNA(bestDNA);
};

WorldSolver.prototype.initialize = function(count) {
	for(var i = 0; i < count; i++) {
		var worldDNA = new WorldDNA(this.world);
		worldDNA.randomize();
		worldDNA.fitting = this.processFitting(worldDNA);
		this.population.push(worldDNA);
	}
};

WorldSolver.prototype.evaluate = function() {
	this.population.sort(this.compare);
	for(var i = 0; i < this.population.length; i++) {
		var dna = this.population[i];
//		console.log(i + ":" + dna.fitting);
	}
};

WorldSolver.prototype.compare = function(dna1, dna2) {
	return dna1.fitting - dna2.fitting;
};

WorldSolver.prototype.selectBest = function() {
	return this.population.slice(0, 20);
};

WorldSolver.prototype.nextGeneration = function(selection) {
	var crossOverRatio = 0.2;
	var mutationRatio = 0.2;

	var generated = [];
	for(var i = 0; i < selection.length; i++) {
		var worldDNA = new WorldDNA(this.world);
		worldDNA.copy(selection[i]);
		
		worldDNA.fitting = this.processFitting(worldDNA);
		generated.push(worldDNA);
	}

	var generatedCount = this.populationCount - selection.count;
	for(var i = 0; i < generatedCount * crossOverRatio; i++) {
		var worldDNA = new WorldDNA(this.world);
		
		var selected1 = Math.floor(Math.random() * selection);
		var selected2 = Math.floor(Math.random() * selection);
		
		worldDNA.copy(selection[selected1]);
		worldDNA.crossOver(selection[selected2]);

		worldDNA.fitting = this.processFitting(worldDNA);
		generated.push(worldDNA);
	}

	for(var i = 0; i < generatedCount * mutationRatio; i++)	{
		var worldDNA = new WorldDNA(this.world);
		
		var selected = Math.floor(Math.random() * selection);
		
		worldDNA.copy(selection[selected]);
		worldDNA.mutate();

		worldDNA.fitting = this.processFitting(worldDNA);
		generated.push(worldDNA);
	}

	while(generated.length < this.populationCount)	{
		var worldDNA = new WorldDNA(this.world);
		worldDNA.randomize();
		
		worldDNA.fitting = this.processFitting(worldDNA);
		generated.push(worldDNA);
	}

	this.population = generated;
};

WorldSolver.prototype.processFitting = function(worldDNA) {
	this.applyDNA(worldDNA);

	var collisionsCount = 0;
	for(var i = 0; i < this.world.agents.length - 1; i++) {
		var agent1 = this.world.agents[i];
		for(var j = i+1; j < this.world.agents.length; j++) {
			var agent2 = this.world.agents[j];
			if(this.world.agentsColliding(agent1, agent2)) {
				collisionsCount++;
			}
		}
	}

	return collisionsCount;
};

WorldSolver.prototype.applyDNA = function(worldDNA) {
	for(typeId in this.agentsByTypes) {
		var agents = this.agentsByTypes[typeId];
		var positions = worldDNA.positionsByTypes[typeId];
		for(var i = 0; i < agents.length; i++) {
			var agent = agents[i];
			var position = positions[i];
			agent.x = position.x;
			agent.y = position.y;
		}
	}
};
