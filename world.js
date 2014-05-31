function World(width, height) {
	this.agents = [];
	this.width = width;
	this.height = height;
}

World.prototype.addAgent = function(agent) {
	this.agents.push(agent);
};

World.prototype.removeAgent = function(agent) {
	var agentIndex = this.agents.indexOf(agent);
	if(agentIndex != -1) {
		this.agents.splice(agentIndex, 1);		
	}
};

World.prototype.update = function(dt) {
	this.processCollisions();
	for(var i = 0; i < this.agents.length; i++) {
		var agent = this.agents[i];		
		agent.update(dt);
		this.clampPosition(agent);
		if(agent.dropped != null) {
			this.agents.push(agent.dropped);
			agent.dropped.moveTo(agent.x, agent.y);
			agent.dropped = null;
		}
	}
	this.clearDeadAgents();
};

World.prototype.clearDeadAgents = function() {
	var deadFound = true;
	var startIndex = 0;
	while(deadFound) {
		deadFound = false;
		for(var i = startIndex; i < this.agents.length; i++) {
			var agent = this.agents[i];
			if(agent.dead) {
				this.agents.splice(this.agents.indexOf(agent), 1);
				deadFound = true;
				startIndex = i;
			}
		}
	}
};

World.prototype.processCollisions = function() {
	for(var i = 0; i < this.agents.length; i++) {
		var agent = this.agents[i];
		if(this.agentCollidesBorders(agent)) {
			agent.processCollision(null);
		}
	}
	for(var i = 0; i < this.agents.length - 1; i++) {
		var agent1 = this.agents[i];
		for(var j = i+1; j < this.agents.length; j++) {
			var agent2 = this.agents[j];
			if(this.agentsColliding(agent1, agent2)) {
				if(agent1.contacts(agent2)) {
					agent1.processCollision(agent2);
				}
				if(agent2.contacts(agent1)) {
					agent2.processCollision(agent1);				
				}
			}
			this.processPerception(agent1, agent2);
		}
	}	
};

World.prototype.processPerception = function(agent1, agent2) {
	var deltaVect = new Vect(agent1.x - agent2.x, agent1.y - agent2.y);
	if(deltaVect.length() < (agent1.perceptionRadius + agent2.boundingRadius)) {
		agent1.processPerception(agent2);
	}
	if(deltaVect.length() < (agent2.perceptionRadius + agent1.boundingRadius)) {
		agent2.processPerception(agent1);
	}
}

World.prototype.agentsColliding = function(agent1, agent2) {
	if(agent1.boundingRadius > 0 && agent2.boundingRadius > 0) {
		return this.processCircleCircleCollision(agent1, agent2);
	} else if(agent1.boundingRadius > 0 && agent2.boundingWidth > 0) {
		return this.processCircleRectangleCollision(agent1, agent2);
	} else if(agent2.boundingRadius > 0 && agent1.boundingWidth > 0) {
		return this.processCircleRectangleCollision(agent2, agent1);
	} else if(agent2.boundingWidth > 0 && agent1.boundingWidth > 0) {
		return this.processRectangleRectangleCollision(agent1, agent2);
	}
	return false;
};

World.prototype.processCircleCircleCollision = function(agent1, agent2) {
	var deltaVect = new Vect(agent1.x - agent2.x, agent1.y - agent2.y);
	if(deltaVect.length() < (agent1.boundingRadius + agent2.boundingRadius)) {
		if(agent1.collides(agent2) || agent2.collides(agent1)) {
			var movedAgent = agent1.collides(agent2) ? agent1 : agent2;
			var movingAgent = movedAgent == agent1 ? agent2 : agent1;
			var moveVect = new Vect(movedAgent.x - movingAgent.x,movedAgent.y - movingAgent.y);
			var moveDistance = (agent1.boundingRadius + agent2.boundingRadius) - deltaVect.length();
			movedAgent.moveBy(moveVect, moveDistance);
		}

		return true;
	}
	return false;
};

World.prototype.processCircleRectangleCollision = function(agent1, agent2) {
	var circleX = agent1.x;
	var circleY = agent1.y;
	var circleRadius = agent1.boundingRadius;

	var rectMinX = agent2.x - agent2.boundingWidth/2;
	var rectMaxX = agent2.x + agent2.boundingWidth/2;
	var rectMinY = agent2.y - agent2.boundingHeight/2;
	var rectMaxY = agent2.y + agent2.boundingHeight/2;

	var closestX = (circleX <= rectMinX) ? rectMinX : (circleX >= rectMaxX) ? rectMaxX : circleX;
	var closestY = (circleY <= rectMinY) ? rectMinY : (circleY >= rectMaxY) ? rectMaxY : circleY;

	var deltaVect = new Vect(circleX - closestX, circleY - closestY);

	if (deltaVect.length() <= circleRadius) {
		if(agent1.collides(agent2)) {
			agent1.x = agent1.previousX;
			agent1.y = agent1.previousY;
		} else if(agent2.collides(agent1)) {

		}

		return true;
	}
	return false;
}

World.prototype.processRectangleRectangleCollision = function(agent1, agent2) {
	var rect1MinX = agent1.x - agent1.boundingWidth/2;
	var rect1MaxX = agent1.x + agent1.boundingWidth/2;
	var rect1MinY = agent1.y - agent1.boundingHeight/2;
	var rect1MaxY = agent1.y + agent1.boundingHeight/2;

	var rect2MinX = agent2.x - agent2.boundingWidth/2;
	var rect2MaxX = agent2.x + agent2.boundingWidth/2;
	var rect2MinY = agent2.y - agent2.boundingHeight/2;
	var rect2MaxY = agent2.y + agent2.boundingHeight/2;


	var overlapX = false;
	if(isBetween(rect1MinX, rect2MinX, rect2MaxX)
	  || (isBetween(rect2MinX, rect1MinX, rect1MaxX))) {
		overlapX = true;
	}
 
	var overlapY = false;
	if(isBetween(rect1MinY, rect2MinY, rect2MaxY)
	  || (isBetween(rect2MinY, rect1MinY, rect1MaxY))) {
		overlapY = true;
	}

 
   return (overlapX && overlapY);

}

function isBetween(x, a, b) {
	return (x >= a) && (x <= b);
}

World.prototype.agentCollidesBorders = function(agent) {
	if(agent.x - agent.boundingRadius <= 0) return true;
	if(agent.x + agent.boundingRadius >= this.width) return true;
	if(agent.y - agent.boundingRadius <= 0) return true;
	if(agent.y + agent.boundingRadius >= this.height) return true;

	return false;
};

World.prototype.clampPosition = function(agent) {
	if(agent.x - agent.boundingRadius < 0) agent.x = agent.boundingRadius;
	if(agent.x + agent.boundingRadius > this.width) agent.x = this.width - agent.boundingRadius;
	if(agent.y - agent.boundingRadius < 0) agent.y = agent.boundingRadius;
	if(agent.y + agent.boundingRadius > this.height) agent.y = this.height - agent.boundingRadius;
};



World.prototype.draw = function(context) {
	this.agents.forEach(function(agent) {
		agent.draw(context);
	});
};

World.prototype.keepWallsInWorld = function () {
    for (var i = 0; i < this.agents.length; ++i) {
        var agent = this.agents[i];
        if (agent.typeId == 'wall') {
            if (agent.x - agent.boundingWidth * 0.5 < 0) {
                agent.boundingWidth = agent.boundingWidth * 0.5 - agent.x;
                agent.x = agent.boundingWidth * 0.5;
            }
            if (agent.y - agent.boundingHeight * 0.5 < 0) {
                agent.boundingHeight = agent.boundingHeight * 0.5 - agent.y;
                agent.y = agent.boundingHeight * 0.5;
            }
            if (agent.x + agent.boundingWidth * 0.5 > this.width) {
                agent.boundingWidth = agent.boundingWidth * 0.5 - (agent.x - this.width);
                agent.x = this.width - agent.boundingWidth * 0.5;
            }
            if (agent.y + agent.boundingHeight * 0.5 > this.height) {
                agent.boundingHeight = agent.boundingHeight * 0.5 - (agent.y - this.height);
                agent.y = this.height - agent.boundingHeight * 0.5;
            }
        }
    }
};
