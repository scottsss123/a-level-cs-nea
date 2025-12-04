class Camera {
    #pos;
    #zoom;
    #scaleFactor;
    #focusOffset;
    #relativeCentre;

    constructor(inPos, inZoom) {
        this.#pos = inPos;
        this.#zoom = inZoom;
        // takes diameter of earth (meters) to 50 pixels
        this.#scaleFactor = 50 / 12756274;
        this.#focusOffset = [0,0];
    }
    updatePosition(displacement) {
        this.#pos[0] += displacement[0];
        this.#pos[1] += displacement[1];
    }
    updateFocusOffset(displacement) { 
        this.#focusOffset[0] += displacement[0];
        this.#focusOffset[1] += displacement[1];
    }
    setPosition(newPos) {
        this.#pos[0] = newPos[0];
        this.#pos[1] = newPos[1];
    }
    setZoom(inZoom) {
        this.#zoom = inZoom;
    }
    setRelativeCentre(inRelativeCentre) {
        this.#relativeCentre = inRelativeCentre;
    }
    
    adjustZoom(sf) {
        this.#zoom = sf * this.#zoom;
    }
    getCanvasPosition(body) {
        // cache body position to not call getPos() twice
        let bodyPos = body.getPos();
        // calculate body x,y on canvas relative to camera position and zoom
        let canvasX = ((bodyPos[0] - this.#pos[0] - this.#focusOffset[0]) * this.#scaleFactor * this.#zoom) + (width / 2);
        let canvasY = ((bodyPos[1] - this.#pos[1] - this.#focusOffset[1]) * this.#scaleFactor * this.#zoom) + (height / 2);
        return [canvasX, canvasY]; 
    }
    getSimPointCanvasPosition(x, y) {
        let canvasX = ((x - this.#pos[0] - this.#focusOffset[0]) * this.#scaleFactor * this.#zoom) + (width / 2);
        let canvasY = ((y - this.#pos[1] - this.#focusOffset[1]) * this.#scaleFactor * this.#zoom) + (height / 2);
        return [canvasX, canvasY]; 
    }
    getCursorSimPosition(x,y) { // mouseX, mouseY
        let mousePos = [x - width / 2, y - height /2];
        let simPos = [mousePos[0] / (this.#scaleFactor * this.#zoom), mousePos[1] / (this.#scaleFactor * this.#zoom)];
        simPos[0] += this.#pos[0] + this.#focusOffset[0];
        simPos[1] += this.#pos[1] + this.#focusOffset[1];

        return simPos;
    }
    getCanvasDiameter(body) {
        // calculate and return body canvas diameter based on camera zoom
        return body.getDiameter() * this.#scaleFactor * this.#zoom;
    }
    getPos() {
        return this.#pos;
    }
    getZoom() {
        return this.#zoom;
    }
    getScaleFactor() {
        return this.#scaleFactor;
    }
    getRelativeCentre() {
        return this.#relativeCentre;
    }

    mouseOverlapsBody(body, mousePosition) {
        // cache body's position and radius on canvas
        let bodyCanvasPosition = this.getCanvasPosition(body);
        let bodyRadius = this.getCanvasDiameter(body);
        // calculate distance "radius" between center of body and mouse cursor
        let radius = Math.sqrt((bodyCanvasPosition[0]-mousePosition[0])**2 + ((bodyCanvasPosition[1]-mousePosition[1])**2));
        
        // return true if cursor overlaps body
        if (radius <= bodyRadius || radius <= body.getMinCanvasDiameter()) {
            console.log(body.getName(), "overlaps cursor");
            return true;
        }
        return false;
    }

    bodiesOverlap(body1, body2) {  
        let pos1 = this.getCanvasPosition(body1);
        let pos2 = this.getCanvasPosition(body2);

        let dist = Math.sqrt(((pos2[0] - pos1[0])**2) + ((pos2[1] - pos1[1])**2));
        let r1 = this.getCanvasDiameter(body1) / 2;
        let r2 = this.getCanvasDiameter(body2) / 2;
        let maxR = max(r1, r2);

        if (maxR >= dist) {
            return true;
        } else {
            return false;
        }
    }

    resetFocusOffset() {
        this.#focusOffset = [0,0];
    }

    getCameraData() {
        return {
           pos : this.#pos,
           zoom : this.#zoom,
           scaleFactor : this.#scaleFactor,
           focusOffset : this.#focusOffset,
        }
    }

    setData(data) {
        this.#pos = data.pos
        this.#focusOffset = data.focusOffset;
        this.#scaleFactor = data.scaleFactor;
        this.#zoom = data.zoom;
    }
}