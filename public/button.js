let buttonColourDefault = [50,50,200];
let buttonColourHover = [25,25,100];

class Button extends Box {
    // private variables
    #colourDefault;
    #colourHover;
    #stateChange;
    #txt;

    constructor(inX, inY, inWidth, inHeight, inText, inStateChange) {
        
        // box constructor
        super(inX, inY, inWidth, inHeight, buttonColourDefault);
        // additional variable assignment
        this.#colourDefault = this.getColour();
        this.#colourHover = buttonColourHover;
        this.#stateChange = inStateChange;
        this.#txt = inText;
    }   

    // display same as box also with centered text
    display() {
        stroke([50,50,200]);
        super.display();
        textAlign(CENTER, MIDDLE);
        fill([255,255,255]);
        noStroke();
        text(this.#txt, this.getPos()[0], this.getPos()[1]);
    }

    mouseOverlapping() {
        // true/false, mouse in button bounds
        let overlapping = super.mouseOverlapping()
        if (overlapping) {
            this.setColour(this.#colourHover);
        } else {
            this.setColour(this.#colourDefault);
        }
        return overlapping;
    }

    // for changing program state on click
    getStateChange() {
        return this.#stateChange;
    }
    //return text in button
    getContents() {
        return this.#txt;
    }

    setText(inTxt) {
        this.#txt = inTxt;
    }

    // to be overwritten in non-state-changing buttons
    onPress() {
        return;
    }
}

