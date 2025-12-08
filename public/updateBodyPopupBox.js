class UpdateBodyPopupBox extends Box {
    #linkedBody
    #linkedCamera
    #displayMassUnit
    #displaySpeedUnit
    #displayDistanceUnit

    constructor(inX, inY, inWidth, inHeight, inLinkedBody, inLinkedCamera, inDisplayMassUnit, inDisplaySpeedUnit, inDisplayDistanceUnit) {
        super(inX + inWidth / 2, inY + inHeight / 2, inWidth , inHeight , [30,30,30]);
    
        this.#linkedBody = inLinkedBody;
        this.#linkedCamera = inLinkedCamera;

        this.updateLinePositions();
        this.updateUnits(inDisplayMassUnit, inDisplaySpeedUnit, inDisplayDistanceUnit);
    }

    updateLinePositions() {
        let pos = this.getPos();
        this.leftX = pos[0] - this.getWidth() / 2;
        this.rightX = pos[0] + this.getWidth() / 2;
        this.topY = pos[1] - this.getHeight() / 2;
        this.bottomY = pos[1] + this.getHeight() / 2;
        this.underNameLineY = this.topY + 17;
        this.underMassLineY = this.underNameLineY + (this.bottomY - this.underNameLineY) / 3;
        this.underDiameterLineY = this.underMassLineY +  (this.bottomY - this.underNameLineY) / 3;
    }

    updateUnits(inDisplayMassUnit, inDisplaySpeedUnit, inDisplayDistanceUnit) {
        this.#displayMassUnit = inDisplayMassUnit;
        this.#displaySpeedUnit = inDisplaySpeedUnit;
        this.#displayDistanceUnit = inDisplayDistanceUnit;
    }

    display() {
        // draw line to linked body
        let pos = this.getPos();
        let bodyCanvasPos = this.#linkedCamera.getCanvasPosition(this.#linkedBody);
        stroke('white');
        strokeWeight (1);
        line(pos[0] , pos[1], bodyCanvasPos[0], bodyCanvasPos[1]);
        
        if (this === currentlyDragging) {
            strokeWeight (2)
        }

        // draw box
        super.display();
        
        // draw button lines
        stroke('white');
        line(this.leftX, this.underNameLineY, this.rightX, this.underNameLineY);
        line(this.leftX, this.underMassLineY, this.rightX, this.underMassLineY);
        line(this.leftX, this.underDiameterLineY, this.rightX, this.underDiameterLineY);

        // draw button contents
        noStroke();
        fill('white');
        text("Body name: " + this.#linkedBody.getName(), this.leftX + 5, this.topY + 5, this.getWidth(), 12);
        textAlign(CENTER);
        text("Click to update body's mass", this.leftX + this.getWidth() / 2, (this.underMassLineY + this.underNameLineY) / 2 - 6, this.getWidth(), 12);
        text("Click to update body's diameter", this.leftX + this.getWidth() / 2, (this.underDiameterLineY + this.underMassLineY) / 2 - 6, this.getWidth(), 12);
        text("Click to update body's velocity", this.leftX + this.getWidth() / 2, (this.bottomY + this.underDiameterLineY) / 2 - 6, this.getWidth(), 12);
    }

    clicked(x, y) {
        if (x < this.leftX || x > this.rightX || y < this.topY || y > this.bottomY) {
            console.log('mouse out of update body popup bounds on click')
            return true;
        }
        if (y < this.underNameLineY) {
            console.log('change nothing');
        } else if (y < this.underMassLineY) {
            if(!this.changeMass()) {
                return false;
            }
        } else if (y < this.underDiameterLineY) {
            this.changeDiameter();
        } else if (y < this.bottomY) {
            this.changeVelocity();
        }
        return true;
    }

    changeMass() {
        // prompt the user for a new body mass, with the current unit 
        let userInput = prompt('Enter new body mass ( ' + this.#displayMassUnit + ' ) (= ' + (1/massUnits[this.#displayMassUnit]).toPrecision(3) + 'kg )');
        // return / break out of method if user enters invalid answer e.g non-numeric
        if (!userInput || isNaN(userInput)) {
            return true;
        }
        // convert user input to float and standard unit
        let numInput = parseFloat(userInput);
        // return false to delete attached body
        console.log(numInput);
        if (numInput === 0) {
            return false;
        }
        let newMass = numInput * (1/massUnits[this.#displayMassUnit]);
        // update linked body's mass
        this.#linkedBody.setMass(newMass);

        return true;
    }

    changeDiameter() {
        // prompt the user for a new body diameter, with the current unit 
        let userInput = prompt('Enter new body diameter ( ' + this.#displayDistanceUnit + ' ) (= ' + (1/distanceUnits[this.#displayDistanceUnit]).toPrecision(3) + 'm )');
        // return / break out of method if user enters invalid answer e.g non-numeric
        if (!userInput || userInput <= 0 || !parseFloat(userInput)) {
            return;
        }
        // convert user input to float and standard unit
        let numInput = parseFloat(userInput);
        let newDiameter = numInput * (1/distanceUnits[this.#displayDistanceUnit]);
        // update linked body's diameter
        this.#linkedBody.setDiameter(newDiameter);
    }

    changeVelocity() {
        let relativeCentre = this.#linkedCamera.getRelativeCentre();
        //console.log("change vel rel centre vel:", relativeCentre.getVel());

        // prompt the user for a new body speed, with current unit
        let userInput = prompt('Enter new body speed ( leave blank to keep same speed ) ( ' + this.#displaySpeedUnit + ' ) (= ' + (1/speedUnits[this.#displaySpeedUnit]).toPrecision(3) + 'm/s )');
        
        if (!isNaN(userInput) && parseFloat(userInput) == 0) {
            this.#linkedBody.setVel([0,0]);
            return;
        }

        let newVel = [];
        
        // calculate current speed and direction of linked body
        let currentVelocity = this.#linkedBody.getVel();
        if ((currentVelocity[0] === 0 && currentVelocity[1] === 0) && !parseFloat(userInput)) return;
        let currentSpeed = Math.sqrt((currentVelocity[0])**2 + (currentVelocity[1])**2);
        let dirVel = [currentVelocity[0] / currentSpeed, currentVelocity[1] / currentSpeed];
        
        // if prompt left blank, keep current speed, if not, set new speed
        let newSpeed = currentSpeed;
        if (parseFloat(userInput)) {
            let numInput = parseFloat(userInput);
            newSpeed = numInput * (1/speedUnits[this.#displaySpeedUnit]);
        }
        
        let angleInput = prompt('Enter new body direction ( leave blank to keep same direction )\n0 = right | 90 = up | -90 = down');
        
        // if prompt left blank, keep same angle, if not, set new angle
        if (!parseFloat(angleInput)) {
            newVel = [dirVel[0] * newSpeed, dirVel[1] * newSpeed];
        } else {
            let angle = -parseFloat(angleInput);
            let radAngle = (angle / 360) * 2 * Math.PI;
            newVel = [newSpeed * Math.cos(radAngle), newSpeed * Math.sin(radAngle)];
        }

        if (relativeCentre instanceof Body) {
            let relativeCentreVelocity = relativeCentre.getVel();
            newVel[0] += relativeCentreVelocity[0];
            newVel[1] += relativeCentreVelocity[1];
        }

        // update body's velocity
        if (newVel) {
            this.#linkedBody.setVel(newVel);
        }
    }

    getLinkedBody() {
        return this.#linkedBody;
    }
}


