class Simulation {
    #bodies; // array of body objects
    #camera; // camera object
    #time;  // float
    #timeRate;  // float
    #prevTimeRate; // float
    #G; // gravitational constant float
    #focus; // bool / string
    #id; // int

    #prevBodyPositions; 
    #prevPathInterval;

    #futureBodyPositions;
    

    constructor() {
        this.#camera = new Camera([0,0], 1);
        this.#bodies = [];
        this.#time = 0;
        this.#timeRate = 0;
        this.#prevTimeRate = 1/60 * 1000;
        this.#G = 6.67430e-11;
        this.#focus = false;
        this.#prevBodyPositions = [];
        this.#prevPathInterval = 1;
        this.#futureBodyPositions = [];
    }


    getBodies() {
        return this.#bodies;
    }
    getCamera() {
        return this.#camera;
    }
    getTime() {
        return this.#time;
    }
    getTimeRate() {
        return this.#timeRate;
    }

    setTime(inTime) {
        this.#time = inTime;
    }
    simpleSetTimeRate(inTimeRate) {
        this.#timeRate = inTimeRate;
    }
    setTimeRate(inTimeRate) {
        this.#prevTimeRate = this.#timeRate;
        this.#timeRate = inTimeRate;
    }
    setFocusByName(inFocusName) {
        let newFocus = this.getBodyByName(inFocusName);
        if (newFocus) {
            this.#focus = newFocus;
        } else {
            // reset simulation focus if nothing inputted into prompt
            this.#focus = false;
        }
    }
    

    updateTime() {
        this.#time += this.#timeRate;
        this.#prevTimeRate = this.#timeRate;
    }
    updateTimeRate(sf) {
        this.#timeRate *= sf;
    }
    addBody(inBody) {
        this.#bodies.push(inBody);
        this.#prevBodyPositions.push([]);
        this.#futureBodyPositions.push([]);
    }
    swapTimeRate() {
        let temp = this.#timeRate;
        this.#timeRate = this.#prevTimeRate;
        this.#prevTimeRate = temp;
    }
    setPrevTimeRate(inTimeRate) {
        this.#prevTimeRate = inTimeRate;
    }
    getPrevTimeRate() {
        return this.#prevTimeRate;
    }

    updateBodyPositions() {
        for (let body of this.#bodies) {
            body.stepPos(this.#timeRate);
        }
    }

    getBodyByName(name) {
        for (let body of this.#bodies) {
            if (body.getName() === name) {
                return body;
            }
        }
        return false;
    }
    getBodyIndexByName(name) {
        for (let i = 0; i < this.#bodies.length; i++) {
            let body = this.#bodies[i]
            if (body.getName() === name) {
                return i;
            }
        }
    }
    moveCameraToFocus() {
        if (!this.#focus) { 
            return; 
        }
        let focusPos = this.#focus.getPos();
        this.#camera.setPosition(focusPos);
    }
    getFocus() {
        return this.#focus;
    }

    updateBodyVelocities() {
        // for each pair of bodies, bodyi, bodyj
        for (let i = 0; i < this.#bodies.length; i++) {
            for (let j = i + 1; j < this.#bodies.length; j++) {
                
                let body1 = this.#bodies[i];
                let body2 = this.#bodies[j];

                // cache body attributes to number of reduce getter calls
                let pos1 = body1.getPos();
                let pos2 = body2.getPos();

                let mass1 = body1.getMass();
                let mass2 = body2.getMass();

                if (mass1 === 0 || mass2 === 0) {
                    continue;
                }

                // calculate unit vector in direction of bodyi to bodyj, unitVec
                let dir = [pos2[0] - pos1[0], pos2[1] - pos1[1]];
                let modDir = Math.sqrt((dir[0] ** 2) + (dir[1] ** 2));
                let unitVec = [dir[0] / modDir, dir[1] / modDir];
                // calculate magnitude of force, could be extracted to function, F=GM1M2/r^2
                let forceMag = (this.#G * mass1 * mass2) / (modDir ** 2);

                let accelerationMag1 = forceMag / mass1; // a = F / m 
                let accelerationMag2 = -1 * forceMag / mass2;

                let accelerationVec1 = [unitVec[0] * accelerationMag1, unitVec[1] * accelerationMag1];
                let accelerationVec2 = [unitVec[0] * accelerationMag2, unitVec[1] * accelerationMag2];

                // add calculated acceleration to each body
                this.#bodies[i].addVel(accelerationVec1, this.#timeRate);
                this.#bodies[j].addVel(accelerationVec2, this.#timeRate);
            }
        }
    }

    getCentreOfMassPosition() {
        let pos = [0,0];
        let reciprocalOftotalMass = 1 / this.getTotalMass();
        for (let body of this.#bodies) {
            let bodyPos = body.getPos();
            let bodyMass = body.getMass();
            pos[0] += reciprocalOftotalMass * bodyMass * bodyPos[0];
            pos[1] += reciprocalOftotalMass * bodyMass * bodyPos[1];
        }
        return pos;
    }

    getTotalMass() {
        let totalMass = 0;
        for (let body of this.#bodies) {
            totalMass += body.getMass();
        }
        return totalMass;
    }

    getPrevBodyPositions() {
        return this.#prevBodyPositions;
    }

    removePrevBodyPositions(index) {
        this.#prevBodyPositions.splice(index, 1);
    }

    resetPrevBodyPositions() {
        for (let i = 0; i < this.#prevBodyPositions.length; i++) {
            this.#prevBodyPositions[i] = [];
        }
    }

    updatePrevBodyPositions() {
        if (this.#timeRate === 0) {
            return;
        }
        for (let i = 0; i < this.#bodies.length; i++) {
            // add new body position to previous position array and remove oldest position if over 999 elements
            let pos = this.#bodies[i].getPos();

            if (this.#prevBodyPositions[i].length > 999) {
                // remove the first element and shift other elements down by one index
                this.#prevBodyPositions[i].shift();
            }

            this.#prevBodyPositions[i].push([pos[0], pos[1]]);
        }
    }

    resetFutureBodyPositions() {
        for (let i = 0; i < this.#bodies.length; i++) {
            this.#futureBodyPositions[i] = [];
        }
    }

    updateFutureBodyPositions() {
        // set future body position array to empty
        this.resetFutureBodyPositions();

        // clone current simulation 
        let cloneSim = new Simulation();
        cloneSim.setData(JSON.stringify(this.getSimulationData()));
        
        // if simulation paused, still draw future body paths
        if (this.#timeRate === 0) {
            cloneSim.setTimeRate(this.#prevTimeRate);
        }

        // step cloned simulation 1000 times & store body positions
        for (let i = 0; i < 999; i++) {
            for (let j = 0; j < this.#bodies.length; j++) {
                let pos = cloneSim.getBodies()[j].getPos();
                this.#futureBodyPositions[j][i] = [pos[0], pos[1]];
            }
            cloneSim.step();
        }

    }

    getPrevBodyPositionsByIndex(index) {
        return this.#prevBodyPositions[index];
    }

    getFutureBodyPositionsByIndex(index) {
        return this.#futureBodyPositions[index];
    }

    handleCollisions() { 
        let bodies = this.#bodies;
        let destroyedIndices = [];
        // for each pair of non-destroyed bodies, bodyi & bodyj
        for (let i = 0; i < bodies.length; i++) {
            if (destroyedIndices.includes(i)) continue;
            for (let j = i + 1; j < bodies.length; j++) {
                if (destroyedIndices.includes(j)) continue;

                let body1 = bodies[i];
                let body2 = bodies[j];

                if (currentSimulation.getCamera().bodiesOverlap(body1, body2)) {                  
                    let mass1 = body1.getMass();
                    let mass2 = body2.getMass();

                    let survivingBody;
                    let dyingBody;
                    let dyingBodyIndex;

                    // more massive body survives
                    if (mass1 > mass2) {
                        survivingBody = body1;
                        dyingBody = body2;
                        dyingBodyIndex = j;
                    } else {
                        survivingBody = body2;
                        dyingBody = body1;
                        dyingBodyIndex = i;
                    }
                    destroyedIndices.push(dyingBodyIndex);

                    // add less massive body's mass and momentum to more massive body
                    let dyingMass = dyingBody.getMass();
                    let dyingVel = dyingBody.getVel();
                    let dyingMomentum = [dyingVel[0] * dyingMass, dyingVel[1] * dyingMass];

                    let survivingMass = survivingBody.getMass();
                    let survivingVel = survivingBody.getVel();
                    let survivingMomentum = [survivingVel[0] * survivingMass, survivingVel[1] * survivingMass];

                    survivingBody.addMass(dyingMass);
                    survivingMass += dyingMass;

                    let finalMomentum = [dyingMomentum[0] + survivingMomentum[0], dyingMomentum[1] + survivingMomentum[1]];
                    let finalVel = [finalMomentum[0] / survivingMass, finalMomentum[1] / survivingMass];

                    survivingBody.setVel(finalVel);

                    // remove less massive body from simulation
                    
                    this.#prevBodyPositions.splice(dyingBodyIndex, 1)
                    this.#bodies.splice(dyingBodyIndex, 1);                     
                }
            }
        }
    }

    step() {
        this.#time += this.#timeRate;
       
        this.updateBodyVelocities();
        this.updateBodyPositions();           

        return;
    }

    setID(id) {
        this.#id = id;
    }

    getID() {
        return this.#id;
    }

    getSimulationData() {
        let bodyArr = [];
        let focus = false;
        for (let i = 0; i < this.#bodies.length; i++) {
            bodyArr.push(this.#bodies[i].getBodyData());
        }

        if (this.#focus instanceof Body) {
            focus = this.#focus.getBodyData();
        } else {
            focus = false;
        }

        let data = {
            bodies: bodyArr, 
            camera: this.#camera.getCameraData(),
            time: this.#time,
            timeRate: this.#timeRate,
            prevTimeRate: this.#prevTimeRate,
            G: this.#G,  
            focus: focus, 
            id: this.#id,
        }

        return data;
    }

    setData(simulationDataString) {
        let data = JSON.parse(simulationDataString);

        this.#bodies = [];
        for (let i = 0; i < data.bodies.length; i++) {
            let body = data.bodies[i]
            this.#bodies[i] = new Body(body.name, body.pos, body.vel, body.mass, body.diameter, body.image, body.colour );
        }
        
        this.#camera.setData(data.camera);
        if (!data.focus) {
            this.#focus = false;
        } else {
            this.#focus = this.getBodyByName(data.focus.name);
        }

        this.#prevTimeRate = data.prevTimeRate
        this.#time = data.time;
        this.#timeRate = data.timeRate;
        this.#id = data.id;
    }
}
