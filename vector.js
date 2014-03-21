function Vect(x, y) {
	this.x = x;
	this.y = y;
}

Vect.prototype.length = function() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
};

Vect.prototype.normalize = function(length) {
	var currentLength = this.length();
	if(currentLength > 0) {
		this.x = this.x / currentLength * length;
		this.y = this.y / currentLength * length;
	}
};