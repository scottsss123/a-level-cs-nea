// unit names and conversions
// global but mostly needed within the bodyInfoPopupBox class
const massUnits = {
    "kg":1,
    "earths":1/5.97219e24,
    "suns":1/1.989e30
};

const distanceUnits = {
    "m":1,
    "earth diameters": 1/12756274,
    "sun diameters": 1/1.39e9
}

const speedUnits = {
    "m/s": 1,
    "mph": 0.44704,
    "c": 1/299792458
}

class BodyInfoPopupBox extends TextBox {
    // variables linking to body and simulation camera
    #linkedBody
    #linkedCamera
    #displayMassUnit
    #displaySpeedUnit
    #displayDistanceUnit

    constructor(inX, inY, inWidth, inHeight, inLinkedBody, inLinkedCamera, inDisplayMassUnit, inDisplaySpeedUnit, inDisplayDistanceUnit) {
        super(inX, inY, inWidth, inHeight, "");
        this.#linkedBody = inLinkedBody;
        this.#linkedCamera = inLinkedCamera;
        this.#displayMassUnit = inDisplayMassUnit;
        this.#displaySpeedUnit = inDisplaySpeedUnit;
        this.#displayDistanceUnit = inDisplayDistanceUnit;

    }

    display() {

        // draw line from text box to linked body 
        let pos = this.getPos();
        let bodyCanvasPos = this.#linkedCamera.getCanvasPosition(this.#linkedBody);
        
        strokeWeight(2);
        stroke([255,255,255]);
        line(pos[0] , pos[1], bodyCanvasPos[0], bodyCanvasPos[1]);

        strokeWeight(2);
        if (this.mouseOverlapping()) { 
            strokeWeight(4);
        }

        if (this === currentlyDragging) {
            stroke([255, 255, 150])
        } else {
            stroke([255,255,255]);
        }
        
        
        // display textbox contents
        super.display();

       
    }

    updateBodyInfo() {
        let relativeCentre = this.#linkedCamera.getRelativeCentre();

        // stores linked body's attributes
        // not relative to simulation centre
        let bodyName = this.#linkedBody.getName();
        let bodyDiameter = (this.#linkedBody.getDiameter() * distanceUnits[this.#displayDistanceUnit]).toPrecision(3);
        let bodyMass = (this.#linkedBody.getMass() *  massUnits[this.#displayMassUnit]).toPrecision(3);

        // relative to simulation centre
        let bodyPosition = this.#linkedBody.getPos();
        let bodyVelocity = this.#linkedBody.getVel();

        if (relativeCentre instanceof Body) {
            let relativeCentrePos = relativeCentre.getPos();
            bodyPosition = [bodyPosition[0] - relativeCentrePos[0], bodyPosition[1] - relativeCentrePos[1]];
            let relativeCentreVelocity = relativeCentre.getVel();
            bodyVelocity = [bodyVelocity[0] - relativeCentreVelocity[0], bodyVelocity[1] - relativeCentreVelocity[1]];
        }

        let bodyVelocityMagnitude = (Math.sqrt((bodyVelocity[0])**2 + (bodyVelocity[1])**2) * speedUnits[this.#displaySpeedUnit]).toPrecision(3);
        // calculate angle of body's velocity currently standard angle 
        let bodyVelocityDirection = -(Math.atan2(bodyVelocity[1], bodyVelocity[0]) * 180 / Math.PI).toPrecision(3);

        let modPos = Math.sqrt(bodyPosition[0]**2 + bodyPosition[1]**2);
        let argPos = -(Math.atan2(bodyPosition[1], bodyPosition[0]) * 180 / Math.PI).toPrecision(3);

        let newContents = "Body Name: " + bodyName + "\n \nBody Position (x, y):\n" + (bodyPosition[0] * distanceUnits[this.#displayDistanceUnit]).toPrecision(3) + " " + this.#displayDistanceUnit + ", " + (bodyPosition[1] * distanceUnits[this.#displayDistanceUnit]).toPrecision(3) + " " + this.#displayDistanceUnit + "\n" + (modPos * distanceUnits[this.#displayDistanceUnit]).toPrecision(3) + " " + this.#displayDistanceUnit + ", " + argPos + "°\nBody mass: " + bodyMass + " " + this.#displayMassUnit + "\nBody diameter: " + bodyDiameter + " " + this.#displayDistanceUnit + "\nBody velocity: " + bodyVelocityMagnitude + " " + displaySpeedUnit + "\nBody direection: " + bodyVelocityDirection + '°';
        // updates text contents with updated attributes
        super.updateContents(newContents);
    }

    setPosCorner(newPos) {
        super.setPos(newPos[0] - this.getWidth() / 2 , newPos[1] - this.getHeight() / 2);
    }

    getPosCorner() {
        let centerPos = this.getPos();
        return [centerPos[0] - this.getWidth() / 2, centerPos[1] - this.getHeight() / 2];
    }

    updateUnits(inDisplayMassUnit, inDisplaySpeedUnit, inDisplayDistanceUnit) {
        this.#displayMassUnit = inDisplayMassUnit;
        this.#displaySpeedUnit = inDisplaySpeedUnit;
        this.#displayDistanceUnit = inDisplayDistanceUnit;
    }
};