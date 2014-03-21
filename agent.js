function Agent () {
	this.typeId = "agent";
	this.x = 0;
	this.y = 0;
	this.boundingRadius = 0; // rayon de collision pour toucher une ressource en px
	this.perceptionRadius = 0; //rayon dans lequel elle peut percevoir d'autres agents (sorte de collision)
	this.collideTypes = []; //agents dans lesquels on ne peut pas rentrer (termites rentre pas dans bois)
	this.contactTypes = []; //mettre la liste des agents dans lesquels on veut une collision
	
	this.dropped = null; //ne pas toucher
	this.dead = false; //enlever un tas de bois quand il n'a plus de ressources
}

Agent.prototype.update = function(dt) {
	// fonction envoyŽe toutes les frames 60 fois par seconde
	// va appeler l'update de tous les autres agents
	// on dŽcide de ce qu'on veut faire dans le monde
	// dt = delta de temps depuis le dernier update, peut permettre de calculer le dŽplacement
};

Agent.prototype.draw = function(context) {
	// permet de se dessiner dans le monde
	// dessiner directement un rond
	// je chsoisis si je me dessine en rouge ou noir en fonction si je porte un tas de bois
};

Agent.prototype.processCollision = function(collidedAgent) {
	// appelŽ si collision avec un agent
};

Agent.prototype.processPerception = function(perceivedAgent) {
	// appelŽ si perception avec un agent
};

Agent.prototype.collides = function(agent) {
	if(this.collideTypes.indexOf(agent.typeId) != -1) {
		return true;
	}
	return false;
};

Agent.prototype.contacts = function(agent) {
	if(this.contactTypes.indexOf(agent.typeId) != -1) {
		return true;
	}
	return false;
};

Agent.prototype.drop = function(agent) {
	this.dropped = agent;
};

Agent.prototype.moveTo = function(x, y) {
	this.x = x;
	this.y = y;
};

Agent.prototype.moveBy = function(direction, length) {
	if(direction.x != 0 && direction.y != 0 && length > 0) {
		var moveVect = new Vect(direction.x, direction.y);
		moveVect.normalize(length);
		//console.log(direction.x, direction.y);
		this.x += moveVect.x;
		this.y += moveVect.y;
	}
};
