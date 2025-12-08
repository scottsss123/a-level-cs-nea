class Body {
    #pos;
    #vel;
    #mass;
    #diameter;
    #image;
    #colour;
    #name;
    #minCanvasDiameter;

    constructor(inName, inPos, inVel, inMass, inDiameter, inImage, inColour) {
        this.#name = inName;
        this.#pos = inPos;
        this.#vel = inVel;
        this.#mass = inMass;
        this.#diameter = inDiameter;
        this.#image = inImage;
        this.#colour = inColour;
        this.#minCanvasDiameter = 3;
    }

    getName() {
        return this.#name;
    }
    getPos() {
        return this.#pos;
    }
    getVel() {
        return this.#vel;
    }
    getMass() {
        return this.#mass;
    }
    getDiameter() {
        return this.#diameter;
    }
    getImage() {
        return this.#image;
    }
    getColour() {
        return this.#colour;
    }
    getMinCanvasDiameter() {
        return this.#minCanvasDiameter;
    }
    getSpeed() {
        let v = this.#vel;
        return Math.sqrt(v[0]**2 + v[1]**2);
    }
    

    setName(inName) {
        this.#name = inName;
    }
    setPos(inPos) {
        this.#pos[0] = inPos[0];
        this.#pos[1] = inPos[1];
    }
    setVel(inVel) {
        this.#vel[0] = inVel[0];
        this.#vel[1] = inVel[1];
    }
    setMass(inMass) {
        this.#mass = inMass;
    }
    setDiameter(inDiameter) {
        this.#diameter = inDiameter;
    }
    setImage(inImage) {
        this.#image = inImage;
    }
    setMinCanvasDiameter(inMinCanvasDiameter) {
        this.#minCanvasDiameter = inMinCanvasDiameter;
    }
    addMass(inMass) {
        this.#mass += inMass;
    }
    

    stepPos(inTimeRate) {
        this.#pos[0] +=  inTimeRate * this.#vel[0];
        this.#pos[1] +=  inTimeRate * this.#vel[1];
    }
    addVel(inAcceleration, inTimeRate) {
        this.#vel[0] += inTimeRate * inAcceleration[0];
        this.#vel[1] += inTimeRate * inAcceleration[1];
    }

    getBodyData() {
        return {
            pos: this.#pos,
            vel: this.#vel,
            mass: this.#mass,
            diameter: this.#diameter,
            image: this.#image,
            colour: this.#colour,
            name: this.#name,
            minCanvasDiameter: this.#minCanvasDiameter
        }
    }
}