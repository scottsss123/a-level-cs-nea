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

    getSimDistance(canvasDistance) {
        let b = this.getCursorSimPosition(canvasDistance, 0)[0];
        let a = this.getCursorSimPosition(0,0)[0];
        return Math.abs(b-a);
    }

    mouseOverlapsBody(body, mousePosition) {
        // cache body's position and radius on canvas
        let bodyCanvasPosition = this.getCanvasPosition(body);
        let bodyRadius = this.getCanvasDiameter(body) / 2;
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
        // calculate toptal radius
        let bodyPosition1 = body1.getPos();
        let bodyPosition2 = body2.getPos();
        let r1 = body1.getDiameter();
        let r2 = body2.getDiameter();
        let rTotal = r1 + r2;
        // calculate distance "radius" between center of bodies
        let radius = Math.sqrt((bodyPosition1[0]-bodyPosition2[0])**2 + ((bodyPosition1[1]-bodyPosition2[1])**2));
        
        // return true if overlap
        if (radius <= rTotal) {
            return true;
        }
        return false;
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