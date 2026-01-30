// declare new class 'box' for menus
class Box {
    // private attributes
    #pos;
    #width;
    #height;
    #colour; 
   
    // public procedure 'new'
    constructor (inX, inY, inWidth, inHeight, inColour) { 
        // initialise private attributes to given parameters
        this.#pos = [inX, inY];
        this.#width = inWidth;
        this.#height = inHeight;
        this.#colour = inColour;
    }

    // default display for menu boxes, for testing as should be overwritten by box's child classes
    display() {
        if (this instanceof TextBox && (this instanceof BodyInfoPopupBox) === false && (this instanceof UpdateBodyPopupBox) === false) {
            stroke([255,255,255]);
        }
        fill(this.#colour);
        rect(this.#pos[0], this.#pos[1], this.#width, this.#height);
    }

    // return true if mouse is within box, false if not
    mouseOverlapping() {
        if (mouseX >= this.#pos[0] - (this.#width / 2) 
         && mouseX <= this.#pos[0] + (this.#width / 2)
         && mouseY >= this.#pos[1] - (this.#height / 2)
         && mouseY <= this.#pos[1] + (this.#height / 2)) {
            return true;
        } else {
            return false;
        }
    }

    getPos() {
        return this.#pos;
    }
    getWidth() {
        return this.#width;
    }
    getHeight() {
        return this.#height;
    }
    getColour() {
        return this.#colour;
    }

    setColour(inColour) {
        this.#colour = inColour;
    }

    setPos(pos) {
        this.#pos[0] = pos[0];
        this.#pos[1] = pos[1];

    }
};