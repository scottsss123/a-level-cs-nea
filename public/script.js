var socket = io.connect();

// initialising global variables
const states = ['main menu', 'main simulation', 'learn menu', 'pause menu', 'simulation tutorial menu', 'physics information menu', 'newtonian mechanics menu', 'si units menu', 'settings menu', 'profile menu', 'save simulation menu', 'load simulation menu', 'my simulations menu', 'public simulations menu'];

// storing image data
let starFieldBackgroundImage;
let pauseIconImage,playIconImage,cameraIconImage;
let earthImage;
let moonImage;

// music data
let music;
let switchSound;

let mainButtonWidth;
let mainButtonHeight;
// 2d list of lists of buttons: buttons[i] is the list of buttons to be shown in state = i
let buttons = [];
// 2d list of lists of textBoxes: "
let textBoxes = [];
let state = 0;
// textBox displaying program stateS
let stateIndicator;
// holds current simulation object
let currentSimulation;
// holds quick saved simulation
let quickSavedSimulation;
// icon variables
let pauseIcon, playIcon, cameraIcon;
let iconWidth = 32;
let iconHeight = 32;
let icons = [];
// toolbar textBox setup
let timeRateTextBox, timeTextBox, camPosTextBox, camZoomTextBox;
let infoPopupBoxes = [];

let displayDistanceUnit = 'm';
let displayMassUnit = 'kg';
let displaySpeedUnit = 'm/s';

let currentlyDragging = -1;
let updateBodyPopupBox = -1;
let newBodyNumber = 0;

let currentUserName = 'guest';
let currentUserID = 0;

let savedSimulationDescriptionBoxes = [];
let publicSimulationDescriptionBoxes = [];

let bodyImages = {};
let loadSimulationIndex = 0;

// executed before setup to load assets in more modular way
function preload() {
    loadFont("./assets/monoMMM_5.ttf");
    starFieldBackgroundImage = loadImage("./assets/starfield.png");

    bodyImages["earth"] = loadImage("./assets/earth.png");
    bodyImages["venus"] = loadImage("./assets/venus.png");
    bodyImages["moon"] = loadImage("./assets/moon.png");
    bodyImages["mercury"] = loadImage("./assets/moon.png");
    bodyImages["mars"] = loadImage("./assets/mars.png");
    bodyImages["jupiter"] = loadImage("./assets/jupiter.png");
    bodyImages["sun"] = loadImage("./assets/sun.png");
    bodyImages["saturn"] = loadImage("./assets/saturn.png");
    bodyImages["uranus"] = loadImage("./assets/uranus.png");
    bodyImages["neptune"] = loadImage("./assets/neptune.png");
    
    cameraIconImage = loadImage("./assets/cameraIcon.png");
    pauseIconImage = loadImage("./assets/pauseIcon.png");
    playIconImage = loadImage("./assets/playIcon.png");

    music = loadSound('./assets/Victoriana Loop.mp3');
    switchSound = loadSound('./assets/switch.wav');
    switchSound.volume = 1;
}

// first function containing logic, is run immediately after preload by q5 library
function setup() {
    
    socket.on('loginError', (err) => { loginError(err) });
    socket.on('alert', (txt) => {alert(txt)});
    socket.on('log', (data) => {console.log(data)});
    socket.on('setUser', (data) => { setUser(data) });
    socket.on('loadSettings', (settings) => { loadSettings(settings) });
    socket.on('setCurrentSimulationID', (id) => { currentSimulation.setID(id); });
    socket.on('setCurrentSimulation', (data) => { setCurrentSimulation(data); });
    socket.on('updateSavedSimulationDescriptionBoxes', (userSimulationMetaDatas) => { updateSavedSimulationDescriptionBoxes(userSimulationMetaDatas); });
    socket.on('updatePublicSimulationDescriptionBoxes', (publicSimulationMetaDatas) => { updatePublicSimulationDescriptionBoxes(publicSimulationMetaDatas);})

    // q5 function and inbuilt variables
    createCanvas(windowWidth, windowHeight, WEBGL);

    // draw rectangle objects with their co-ordinates at their center
    rectMode(CENTER);
    frameRate(60);
    
    
    let learnMenuTextBoxWidth;
    let learnMenuTextBoxHeight;
    function initialiseMenuButtons() {
        mainButtonWidth = windowWidth / 3;
        mainButtonHeight = windowHeight / 15;
        let mainMenuButtonX = windowWidth / 2;
        let mainMenuButtonOffset = 0.5 * (mainButtonHeight + 10);
        let topRightMenuButtonX = windowWidth - (mainButtonWidth / 2) - 40;
        let topMenuButtonY = mainButtonHeight / 2 + 20;
        let largeLeftButtonX = (topRightMenuButtonX - mainButtonWidth / 2) / 2;
        let largeButtonWidth = topRightMenuButtonX - mainButtonWidth / 2 - 20 - 20;
        learnMenuTextBoxWidth = largeButtonWidth;

        // initialising main menu buttons
        let mainMenuButtons = [];
        //new simulation button
        mainMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) - mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'simulation', states.indexOf('main simulation')));
        // learn button
        mainMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'learn', states.indexOf('learn menu')));
        // settings button
        mainMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + (3 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'settings', states.indexOf('settings menu')));
        // profile button
        mainMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + (5 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'Profile', states.indexOf('profile menu')));

        // initialising learn menu buttons
        let learnMenuButtons = [];
        // simulation tutorial button
        learnMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) - 3 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'simulation tutorial', states.indexOf('simulation tutorial menu')));
        // physics info button
        learnMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) - mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'physics information menu', states.indexOf('physics information menu')));
        // to be added button
        learnMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, '...', -1));
        // main menu button
        learnMenuButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + 3 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));

        let profileButtons = [];
        let logInButton = new Button(mainMenuButtonX, (windowHeight / 2) - mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'Log In', -1);

        logInButton.onPress = () => {
            let inUsername = prompt("Log In:\nLeave blank to cancel\nEnter username: ");
            if (!inUsername) {
                return;
            }
            let inPassword = prompt("Log In:\nEnter password: ");
            let inPasswordHash = inPassword; // no password hash yet
            let data = { username: inUsername, passwordHash: inPasswordHash };
            socket.emit('loginUser', data);
        }

        let signUpButton = new Button(mainMenuButtonX, (windowHeight / 2) + mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'Sign Up', -1);

        signUpButton.onPress = () => {
            let inUsername = prompt("Sign Up:\nLeave blank to cancel\nEnter username: ");
            if (inUsername.length === 0) {
                return;
            }
            let inPassword = prompt("Sign Up:\nEnter password (use unique password): ");
            let inPasswordHash = inPassword; // no password hash yet
            let data = { username: inUsername, passwordHash: inPasswordHash };
            socket.emit('signupUser', data);
        }

        let logOutButton = new Button(mainMenuButtonX, (windowHeight / 2) + (3 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'Log Out', -1);
        logOutButton.onPress = () => logOut();
        profileButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + (5 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'Main Menu', states.indexOf('main menu')));
        profileButtons.push(logInButton);
        profileButtons.push(signUpButton);
        profileButtons.push(logOutButton);

        
        // initialising pause menu buttons
        let pauseMenuButtons = [];
        // unpause button
        pauseMenuButtons.push(new Button(windowWidth / 2, (windowHeight / 2) - 5 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'continue simulation', states.indexOf('main simulation')));
        // learn button
        pauseMenuButtons.push(new Button(windowWidth / 2, (windowHeight / 2) - 3 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'learn', states.indexOf('learn menu')));
        // settings menu button
        pauseMenuButtons.push(new Button(windowWidth / 2, (windowHeight / 2) - 1 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'settings', states.indexOf('settings menu')));
        // save & load simulation buttons
        pauseMenuButtons.push(new Button(windowWidth / 2, (windowHeight / 2) + 1 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'save simulation', states.indexOf('save simulation menu')));
        pauseMenuButtons.push(new Button(windowWidth / 2, (windowHeight / 2) + 3 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'load simulation', states.indexOf('load simulation menu')));
	    // main menu button
        pauseMenuButtons.push(new Button(windowWidth / 2, (windowHeight / 2) + 5 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));

        // save simulation menu buttons
	    let saveSimulationButtons = [];
	    saveSimulationButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + (3 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'back', states.indexOf('pause menu')));
	    let saveSimulationButton = new Button(mainMenuButtonX, (windowHeight / 2) - (1 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'save simulation', -1);
	    let saveAsNewSimulationButton = new Button(mainMenuButtonX, (windowHeight / 2) + 1 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'save as new simulation', -1);
	    saveSimulationButton.onPress = saveSimulation;
	    saveAsNewSimulationButton.onPress = saveAsSimulation;
	    saveSimulationButtons.push(saveSimulationButton);
	    saveSimulationButtons.push(saveAsNewSimulationButton);
	
	    // load simulation menu buttons
	    let loadSimulationButtons = [];
        let mySimulationsButton = new Button(mainMenuButtonX, (windowHeight / 2) - (1 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'my simulations', states.indexOf('my simulations menu'));
        let publicSimulationsButton = new Button(mainMenuButtonX, (windowHeight / 2) + (1 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'public simulations', states.indexOf('public simulations menu'));
        mySimulationsButton.onPress = () => { 
            loadSimulationIndex = 0;
            socket.emit('updateSavedSimulationDescriptionBoxes', currentUserID);
        };
        publicSimulationsButton.onPress = () => { 
            loadSimulationIndex = 0;
            socket.emit('updatePublicSimulationDescriptionBoxes');
        };
        loadSimulationButtons.push(mySimulationsButton);
        loadSimulationButtons.push(publicSimulationsButton);
	    loadSimulationButtons.push(new Button(mainMenuButtonX, (windowHeight / 2) + (3 * mainMenuButtonOffset), mainButtonWidth, mainButtonHeight, 'back', states.indexOf('pause menu')));

        // load my simulations menu buttons
        let mySimulationsButtons = [];
        mySimulationsButtons.push(new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'back', states.indexOf('load simulation menu')));

        // load public simulations menu buttons
        let publicSimulationsButtons = [];
        publicSimulationsButtons.push(new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'back', states.indexOf('load simulation menu')));

	    // simulation tutorial menu buttons
        let simTutorialMenuButtons = [];
        simTutorialMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'learn', states.indexOf('learn menu')));
        simTutorialMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));

        // physics info menu buttons
        let physicsInfoMenuButtons = [];
        physicsInfoMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'learn', states.indexOf('learn menu')));
        physicsInfoMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));
        physicsInfoMenuButtons.push(new Button(largeLeftButtonX, topMenuButtonY, largeButtonWidth, mainButtonHeight, 'newtonian mechanics', states.indexOf('newtonian mechanics menu')));
        physicsInfoMenuButtons.push(new Button(largeLeftButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, largeButtonWidth, mainButtonHeight, 'SI units', states.indexOf('si units menu')));
        physicsInfoMenuButtons.push(new Button(largeLeftButtonX, topMenuButtonY + 4 * mainMenuButtonOffset, largeButtonWidth, mainButtonHeight, '...', -1));


        // newtonian mechanics info menu buttons
        let newtonianMechanicsMenuButtons = [];
        newtonianMechanicsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'physics info', states.indexOf('physics information menu')));
        newtonianMechanicsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'learn', states.indexOf('learn menu')));
        newtonianMechanicsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 4 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));

        // SI units info menu buttons
        let SIUnitsMenuButtons = [];
        SIUnitsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'physics info', states.indexOf('physics information menu')));
        SIUnitsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'learn', states.indexOf('learn menu')));
        SIUnitsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 4 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));

        // setttings menu buttons
        let settingsMenuButtons = [];
        // main simulation button
        let mainSimulationButton = new Button(topRightMenuButtonX, topMenuButtonY, mainButtonWidth, mainButtonHeight, 'simulation', states.indexOf('main simulation'));
        mainSimulationButton.onPress = updatePopupBoxUnits;
        settingsMenuButtons.push(mainSimulationButton);

        settingsMenuButtons.push(new Button(topRightMenuButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'main menu', states.indexOf('main menu')));

        let saveSettingsButton = new Button(topRightMenuButtonX, topMenuButtonY + 4 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'save user settings',-1);
        saveSettingsButton.onPress = () => {
            socket.emit('saveSettings', { userID: currentUserID, volume:music.volume, lengthUnit:displayDistanceUnit, massUnit:displayMassUnit, speedUnit: displaySpeedUnit });
        }
        settingsMenuButtons.push(saveSettingsButton);

        let loadSettingsButton = new Button(topRightMenuButtonX, topMenuButtonY + 6 * mainMenuButtonOffset, mainButtonWidth, mainButtonHeight, 'load user settings',-1);
        loadSettingsButton.onPress = () => {
            socket.emit('loadSettings', { userID: currentUserID });
        }
        settingsMenuButtons.push(loadSettingsButton);
        
        toggleMusicButton = new Button(largeLeftButtonX, topMenuButtonY, largeButtonWidth, mainButtonHeight, 'toggle sound', -1);
        // update button's onPress function to toggle the volume of the background music between 0 and 1 ( on and off )
        toggleMusicButton.onPress = () => {
            music.volume = music.volume === 1 ? 0 : 1;
            switchSound.volume = switchSound.volume === 1 ? 0 : 1;
        }
        settingsMenuButtons.push(toggleMusicButton);
        
        changeDisplayMassUnitButton = new Button(largeLeftButtonX, topMenuButtonY + 2 * mainMenuButtonOffset, largeButtonWidth, mainButtonHeight, 'change mass unit : ' + displayMassUnit, -1);
        changeDisplayMassUnitButton.onPress = () => {
            switch (displayMassUnit) {
                case 'kg':
                    displayMassUnit = 'earths';
                    break;
                case 'earths':
                    displayMassUnit = 'suns';
                    break;
                case 'suns':
                    displayMassUnit = 'kg';
                    break;
                default:
                    console.log('invalid displayMassUnit');
            }
            changeDisplayMassUnitButton.setText('change mass unit : ' + displayMassUnit);
        }
        settingsMenuButtons.push(changeDisplayMassUnitButton);

        changeDisplayDistanceUnitButton = new Button(largeLeftButtonX, topMenuButtonY + 4 * mainMenuButtonOffset, largeButtonWidth, mainButtonHeight, 'change distance unit : ' + displayDistanceUnit, -1);
        changeDisplayDistanceUnitButton.onPress = () => {
            switch (displayDistanceUnit) {
                case 'm':
                    displayDistanceUnit = 'earth diameters';
                    break;
                case 'earth diameters':
                    displayDistanceUnit = 'sun diameters';
                    break;
                case 'sun diameters':
                    displayDistanceUnit = 'm';
                    break;
                default:
                    console.log('invalid displayDistanceUnit');
            }
            changeDisplayDistanceUnitButton.setText('change distance unit : ' + displayDistanceUnit);
        }
        settingsMenuButtons.push(changeDisplayDistanceUnitButton);

        changeDisplaySpeedUnitButton = new Button(largeLeftButtonX, topMenuButtonY + 6 * mainMenuButtonOffset, largeButtonWidth, mainButtonHeight, 'change speed unit : ' + displaySpeedUnit, -1);
        changeDisplaySpeedUnitButton.onPress = () => {
            switch (displaySpeedUnit) {
                case 'm/s':
                    displaySpeedUnit = 'mph';
                    break;
                case 'mph':
                    displaySpeedUnit = 'c';
                    break;
                case 'c':
                    displaySpeedUnit = 'm/s';
                    break;
                default:
                    console.log('invalid displaySpeedUnit');
            }
            changeDisplaySpeedUnitButton.setText('change speed unit : ' + displaySpeedUnit);
        }
        settingsMenuButtons.push(changeDisplaySpeedUnitButton);

        let mainMenuButton = new Button(largeLeftButtonX, topMenuButtonY + 8 * mainMenuButtonOffset, largeButtonWidth, mainButtonHeight, '...', -1);
        mainMenuButton.onPress = updatePopupBoxUnits;

        // appending state button arrays to buttons array
        buttons[states.indexOf('main menu')] = mainMenuButtons;
        buttons[states.indexOf('learn menu')] = learnMenuButtons;
        buttons[states.indexOf('pause menu')] = pauseMenuButtons;
        buttons[states.indexOf('simulation tutorial menu')] = simTutorialMenuButtons;
        buttons[states.indexOf('physics information menu')] = physicsInfoMenuButtons;
        buttons[states.indexOf('newtonian mechanics menu')] = newtonianMechanicsMenuButtons;
        buttons[states.indexOf('si units menu')] = SIUnitsMenuButtons;
        buttons[states.indexOf('settings menu')] = settingsMenuButtons;
        buttons[states.indexOf('profile menu')] = profileButtons;
	    buttons[states.indexOf('save simulation menu')] = saveSimulationButtons;
	    buttons[states.indexOf('load simulation menu')] = loadSimulationButtons;
        buttons[states.indexOf('my simulations menu')] = mySimulationsButtons;
        buttons[states.indexOf('public simulations menu')] = publicSimulationsButtons;
    }
    
    function initialiseMenuTextBoxes() {
        let learnMenuTextBoxX = 15;
        let learnMenuTextBoxY = 25;
        learnMenuTextBoxHeight = windowHeight - 2 * learnMenuTextBoxY;

        stateIndicator = new TextBox(3,0, windowWidth / 2, 20, states[state]);
        stateIndicator.toggleDisplayBox();

        let mainMenuTextBoxes = [];
        let titleTextBox = new TextBox(windowWidth/2, windowHeight / 6, windowWidth, windowHeight / 8, 'space simulator'.toLowerCase());
        titleTextBox.setTextSize(12*10);
        titleTextBox.toggleCentered();
        titleTextBox.toggleDisplayBox();
        mainMenuTextBoxes.push(titleTextBox);

        // intialising main simulation info display text boxes
        timeRateTextBox = new TextBox(3 * iconWidth, height - (mainButtonHeight/2) -( 0.5 * textLeading()), width/4, mainButtonHeight / 4, '');
        timeRateTextBox.toggleDisplayBox();
        timeTextBox = new TextBox(8*iconWidth, height- (mainButtonHeight/2) -( 0.5 * textLeading()), width/4, mainButtonHeight / 4, '');
        timeTextBox.toggleDisplayBox();
        camZoomTextBox = new TextBox(3 * width / 5 + 2 * iconWidth, height- (mainButtonHeight/2) -( 0.5 * textLeading()), width/4, mainButtonHeight/4, '');
        camZoomTextBox.toggleDisplayBox();
        camPosTextBox = new TextBox(3 * width / 5 + 4 * iconWidth, height - (mainButtonHeight /2) - (0.5* textLeading()), width/4, mainButtonHeight/4, '');
        camPosTextBox.toggleDisplayBox();
        let mainSimulationTextBoxes = [timeRateTextBox, timeTextBox, camZoomTextBox, camPosTextBox];
    

        let simulationTutorialTextBoxes = [];
        simulationTutorialTextBoxes.push(new TextBox(learnMenuTextBoxX, learnMenuTextBoxY, learnMenuTextBoxWidth, learnMenuTextBoxHeight, simulationTutorialString));

        let newtonianMechanicsTextboxes = [];
        newtonianMechanicsTextboxes.push(new TextBox(learnMenuTextBoxX, learnMenuTextBoxY, learnMenuTextBoxWidth, learnMenuTextBoxHeight, newtonsLawsOfMotionString));

        let SIUnitsTextBoxes = [];
        SIUnitsTextBoxes.push(new TextBox(learnMenuTextBoxX, learnMenuTextBoxY, learnMenuTextBoxWidth, learnMenuTextBoxHeight, SIUnitsString));

        textBoxes[states.indexOf('main menu')] = mainMenuTextBoxes;
        textBoxes[states.indexOf('main simulation')] = mainSimulationTextBoxes;
        textBoxes[states.indexOf('pause menu')] = mainSimulationTextBoxes;
        textBoxes[states.indexOf('simulation tutorial menu')] = simulationTutorialTextBoxes;
        textBoxes[states.indexOf('newtonian mechanics menu')] = newtonianMechanicsTextboxes;
        textBoxes[states.indexOf('si units menu')] = SIUnitsTextBoxes;
    }

    function initialiseMainSimulation() {
        currentSimulation = new Simulation();

        currentSimulation.addBody(new Body('earth', [0,0], [0,29.78e3], 5.972e24, 12756274, "earth", [0,0,255]));
        currentSimulation.addBody(new Body('moon', [384400000, 0], [0,29.78e3+1.022e3], 7.35e22, 3474e3, "moon", [220,220,220]));
       

        currentSimulation.addBody(new Body('sun', [-149.6e9, 0], [0,0], 1.988e30, 1.39e9, "sun", [255,234,0]));

        currentSimulation.addBody(new Body('mars', [-149.6e9 + 2.2794e11,0], [0,24e3], 6.4191e23, 7.9238e6, "mars", [255,0,0]));
        currentSimulation.addBody(new Body('mercury', [-149.6e9 + 5.791e10, 0], [0,47.4e3], 3.3011e23, 4.88e6, "mercury", [220,220,220]));
        currentSimulation.addBody(new Body('venus', [-149.6e9 + 1.0821e11, 0], [0,35e3], 4.8675e24, 1.21036e7, "venus", [200, 20, 20]));
        currentSimulation.addBody(new Body('jupiter', [-149.6e9 + 7.7841e11, 0], [0,13.1e3], 1.8982e27, 1.42984e8, "jupiter", [100, 50, 70]));
        currentSimulation.addBody(new Body('saturn', [-149.6e9 + 1.43e12, 0], [0, 9.69e3], 5.683e26, 1.1647e8, "saturn", [255,255,255]));
        currentSimulation.addBody(new Body('uranus', [-149.6e9 + 2.87e12, 0], [0, 6.835e3], 8.6810e25, 5.0724e7, "uranus", [255,255,255]));
        currentSimulation.addBody(new Body('neptune', [-149.6e9 + 4.5e12, 0], [0, 5.43e3], 1.02409e26, 4.9244e7, "neptune", [255,255,255]));
        
	    //bodies.push(new Body("phobos", 1.06e16, 11e3, [2.2794e11, 9.376e6], [2.1e3, 24e3], 'grey'));
	    //bodies.push(new Body("uranus", 8.6810e25, 5.0724e7, [2.87e12, 0], [0, 6.835e3], '#B2D6DB'));
	    //bodies.push(new Body("neptune", 1.02409e26, 4.9244e7, [4.5e12, 0],[0, 5.43e3], '#7CB7BB'));

        currentSimulation.getBodyByName('moon').setMinCanvasDiameter(0);
        currentSimulation.getBodyByName('sun').setMinCanvasDiameter(8);
//
        //currentSimulation.getCamera().setZoom(1 * (1/1.1) ** 11);
        //currentSimulation.getCamera().setPosition([0, 0]);

        //acurrentSimulation.setFocusByName('earth');

        quickSavedSimulation = new Simulation();
        quickSavedSimulation.setData(JSON.stringify(currentSimulation.getSimulationData()));
    }

    function initialiseIcons() {
        let toolbarIconHeight = height - (mainButtonHeight / 2);

        pauseIcon = new Icon(iconWidth, toolbarIconHeight, iconWidth, iconHeight, pauseIconImage);
        playIcon = new Icon(iconWidth * 2, toolbarIconHeight, iconWidth, iconHeight, playIconImage);
        cameraIcon = new Icon(3 * width / 5 + iconWidth, toolbarIconHeight, iconWidth, iconHeight, cameraIconImage);


        icons[states.indexOf('main simulation')] = [pauseIcon, playIcon, cameraIcon];
    }

    // sets up menu button and text box attributes
    initialiseMenuButtons();
    initialiseMenuTextBoxes();
    initialiseMainSimulation();
    initialiseIcons();
    setAccurateYear();

    // instantiate savedSimulationDescriptionBoxes
    savedSimulationDescriptionBoxes.push(new SimulationDescriptionBox(1 * width / 8 + 0 * 5, height / 5, (width/4) - 5, 0.7 * height));
    savedSimulationDescriptionBoxes.push(new SimulationDescriptionBox(3 * width / 8 + 1 * 5, height / 5, (width/4) - 5, 0.7 * height));
    savedSimulationDescriptionBoxes.push(new SimulationDescriptionBox(5 * width / 8 + 2 * 5, height / 5, (width/4) - 5, 0.7 * height));

    publicSimulationDescriptionBoxes.push(new SimulationDescriptionBox(1 * width / 8 + 0 * 5, height / 5, (width/4) - 5, 0.7 * height));
    publicSimulationDescriptionBoxes.push(new SimulationDescriptionBox(3 * width / 8 + 1 * 5, height / 5, (width/4) - 5, 0.7 * height));
    publicSimulationDescriptionBoxes.push(new SimulationDescriptionBox(5 * width / 8 + 2 * 5, height / 5, (width/4) - 5, 0.7 * height));

    // start looping background music after 10 seconds
    setTimeout(() => { 
        music.volume = 1;
        music.loop = true;
        music.play();
    }, 10000)

    // prevent opening the context menu on right click
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault()
        return false
    })
}

function updateUnitSettingsBoxes() {
    buttons[states.indexOf('settings menu')][5].setText('change mass unit : ' + displayMassUnit); // not the best - magic numbers
    buttons[states.indexOf('settings menu')][6].setText('change distance unit : ' + displayDistanceUnit);
    buttons[states.indexOf('settings menu')][7].setText('change speed unit : ' + displaySpeedUnit);
}

function setUser(data) { //data = { userID : int, username : str}
    currentUserID = data.userID;
    currentUserName = data.username;
}

function logOut() {
    alert('succeessfully logged out');
    currentUserName = "guest";
    currentUserID = 0;
}

function saveSimulation() {
    if(currentUserID <= 0) {
        alert('must be logged in to save simulations, try profile menu');
        return;
    }

    let name = prompt("Save simulation\nEnter simulation name (leave blank to leave name unchanged):");
    let description = prompt("Save simulation\nEnter simulation description (leave blank to leave description unchanged):");
    let isPublic = prompt("Save simulation\nAllow other users to see and load this simulation? (y/n) (leave blank to leave unchanged):");
    
    let currentSimulationID = currentSimulation.getID();
    if (!currentSimulationID) {
        alert("simulation must exist to be saved, try 'save as new simulation'");
        return;
    }

    let data = {
        simulationID: currentSimulationID,
        userID: currentUserID, 
        simulationString: JSON.stringify(currentSimulation.getSimulationData()), 
        isPublic: isPublic,
        name: name,
        description: description,
    };

    socket.emit('saveSimulation', data);
}

function saveAsSimulation() {

    if(currentUserID <= 0) {
        alert('must be logged in to save simulations, try profile menu');
        return;
    }

    let name = prompt("Save as new simulation\nEnter simulation name:");
    let description = prompt("Save as new simulation\nEnter simulation description:");
    let isPublicInput = prompt("Save as new simulation\nAllow other users to see and load this simulation? (y/n)");
    let isPublic = 0;

    if (!name) {
        name = "no simulation name";
    }
    if (!description) {
        description = "no simulation description";
    }
    if(isPublicInput === 'y') {
        isPublic = 1;
    }

    let data = {
        userID: currentUserID, 
        simulationString: JSON.stringify(currentSimulation.getSimulationData()), 
        isPublic: isPublic,
        name: name,
        description: description,
    };

    socket.emit('saveAsSimulation', data);
}

function setCurrentSimulation(simulationDataString) { 
    currentSimulation.setData(simulationDataString);
}

// called once per frame
function update() {

    // execute different logic based on program state
    switch (state) {
        case 0:  // main menu
            break;
        case 1:  // main simulation
            // handle held keys, for camera movement
            mainSimKeyHeldHandler();
            
            if (currentlyDragging instanceof Body) {
                currentlyDragging.setPos(currentSimulation.getCamera().getCursorSimPosition(mouseX,mouseY));
            }

            currentSimulation.step();

            updateInfoPopupBoxes();
            break;
        case 2:  // learn menu
            break;
        case 3:  // pause menu
            timeRateTextBox.updateContents('x0.000')
            break;
        case 4:  // simulation tutorial menu
            break;
        case 5:  // physics info menu
            break;
        case 6:  // newtonian mechanics menu
            break;
        case 7:  // SI units menu
            break;
        default:
            break;
    }
}

// run once per frame, by default 60Hz, by q5 library, for drawing to canvas
function draw() {
    // program logic
    update();


    // starry background
    background(0);
    image(starFieldBackgroundImage, 0, 0, width, height);

    // display different elements based on program state   
    switch (state) {
        case states.indexOf('main menu'):  // main menu
            break;
        case states.indexOf('main simulation'):  // main simulation
            drawCurrentSimBodies();
            drawCurrentSimToolbar();
            drawInfoPopupBoxes();
            drawUpdateBodyPopupBox();
            break;
        case states.indexOf('learn menu'):  // learn menu
            break;
        case states.indexOf('pause menu'):  // pause menu
            drawCurrentSimBodies();
            // possible bodge {
            drawCurrentSimToolbar();
            timeRateTextBox.display();
            // } not necessary to have but i think looks nice
            break;
        case states.indexOf('my simulations menu'):
            drawSavedSimulationsBoxes();
            break;
        case states.indexOf('public simulations menu'):
            drawPublicSimulationsBoxes();
            break;
        default:
            break;
    }

    // display elements of current state

    drawButtons();
    drawTextBoxes();
    drawCurrentState();
    
}

function loadSettings(settings) {
    music.volume = settings.volume;
    displayDistanceUnit = settings.lengthUnit;
    displayMassUnit = settings.massUnit;
    displaySpeedUnit = settings.speedUnit;

    updatePopupBoxUnits();
    updateUnitSettingsBoxes();
}

function updatePublicSimulationDescriptionBoxes(simulationMetaDatas) { 
    let i = 0;
    //  populating the boxes with the first 3 public simulations' information
    for (i; i < 3 && i + loadSimulationIndex < simulationMetaDatas.length; i++) {
        publicSimulationDescriptionBoxes[i].updateContents(simulationMetaDatas[i + loadSimulationIndex]);
    }
    for (i; i < 3; i++) {
        publicSimulationDescriptionBoxes[i].updateContents(-1);
    }
}

function updateSavedSimulationDescriptionBoxes(userSimulationMetaDatas) {
    let i = 0;
    //  populating the boxes with the first 3 public simulations' information
    for (i; i < 3 && i + loadSimulationIndex < userSimulationMetaDatas.length; i++) {
        savedSimulationDescriptionBoxes[i].updateContents(userSimulationMetaDatas[i + loadSimulationIndex]);
    }
    for (i; i < 3; i++) {
        savedSimulationDescriptionBoxes[i].updateContents(-1);
    }
}

function drawSavedSimulationsBoxes() {
    for (let savedSimulationDescriptionBox of savedSimulationDescriptionBoxes) {
        savedSimulationDescriptionBox.display();
    }
}

function drawPublicSimulationsBoxes() {
    for (let publicSimulationDescriptionBox of publicSimulationDescriptionBoxes) {
        publicSimulationDescriptionBox.display();
    }
}

function updatePopupBoxUnits() {
    for (let popupBox of infoPopupBoxes) {
        popupBox.updateUnits(displayMassUnit,displaySpeedUnit,displayDistanceUnit);
    }
    if (updateBodyPopupBox === -1) {
        return;
    }
    updateBodyPopupBox.updateUnits(displayMassUnit,displaySpeedUnit,displayDistanceUnit);
}

// draws buttons of current state
function drawButtons() {
    let stateButtons = buttons[state];
    if (!stateButtons) {
        return;
    }
    for (let button of stateButtons) {
        button.mouseOverlapping();
        button.display();
    }
}

// draw textBoxes in current state
function drawTextBoxes() {
    let stateTextBoxes = textBoxes[state];
    if (!stateTextBoxes) {
        return;
    }
    for (let textBox of stateTextBoxes) {
        textBox.display();
    }
}

function updateInfoPopupBoxes() {
    for (let popupBox of infoPopupBoxes) {
        popupBox.updateBodyInfo();
    }
}

function drawInfoPopupBoxes() {
    for (let popupBox of infoPopupBoxes) {
        popupBox.display();
    }
}

function drawUpdateBodyPopupBox() {
    if (updateBodyPopupBox === -1) {
        return;
    }
    updateBodyPopupBox.display();
}

function drawCurrentState() {
    let currentSimulationID = currentSimulation.getID();
    if (!currentSimulationID) {
        currentSimulationID = "no ID";
    }
    let newStateIndicatorContents = states[state];
    if (state === 1) { newStateIndicatorContents += " - press 'esc' to pause"; }
    else if (state === 3) { newStateIndicatorContents += " - press 'esc' to unpase"; }
    if (state === 1 || state === 3) {
        newStateIndicatorContents += " - simulation ID : " + currentSimulationID; 
    }
    newStateIndicatorContents += " - username : " + currentUserName + " - user ID : " + currentUserID;
    stateIndicator.updateContents(newStateIndicatorContents);
    stateIndicator.display();
}

// checks if clicked on buttons in current state
function buttonsClicked() {
    let stateButtons = buttons[state];
    if (!stateButtons) {
        return;
    }
    // checks each button, if mouse cursor is overlapping it
    for (let button of stateButtons) {
        if (button.mouseOverlapping()) {
            newState = button.getStateChange();
            // if newState is -1, button is not for navigating menus, instead performs some function.
            if (newState !== -1) {
                state = newState;
                
            } 
            button.onPress();
        }
    }
}

function savedSimulationDescriptionBoxPressed() {
    for (let box of savedSimulationDescriptionBoxes) {
        if (box.mouseOverlapping()) {

            if (mouseButton === 'right') {
                let deleteConfirmationInput = prompt("Delete simulation, are you sure ? (y / n)");
                if (deleteConfirmationInput === 'y') {
                    socket.emit('deleteSimulationByID', {simulationID: box.getSimulationID(), userID: currentUserID});
                }
                return;
            }

            let contents = box.getContents();
            if (!contents || contents === "no simulation saved") {
                return;
            }
            
            let simulationID = box.getSimulationID();
            socket.emit('loadSimulationByID', simulationID);
        }
    }
}

function publicSimulationDescriptionBoxPressed() { 
    for (let box of publicSimulationDescriptionBoxes) {
        if (box.mouseOverlapping()) {
            let contents = box.getContents();
            if (!contents || contents === "no simulation saved") {
                return;
            }
            let simulationID = box.getSimulationID();
            socket.emit('loadSimulationByID', simulationID);
        }
    }
}


// can now drag things, may be useful
function mouseDragged() {
    // move popup box if mouse is dragged and initially pressed over popup box
    if (currentlyDragging === -1) {
        return;
    }

    let pos = currentlyDragging.getPos();

    if (currentlyDragging === updateBodyPopupBox) {
        currentlyDragging.setPos([pos[0] + (mouseX - pmouseX), pos[1] + (mouseY - pmouseY)]);
        updateBodyPopupBox.updateLinePositions();
    } else if (currentlyDragging instanceof BodyInfoPopupBox) {
        currentlyDragging.setPos([pos[0] + (mouseX - pmouseX), pos[1] + (mouseY - pmouseY)]);
    }
}

function mousePressed(event) {
    switch (state) {
        case states.indexOf('my simulations menu'):
            savedSimulationDescriptionBoxPressed();
            break;
        case states.indexOf('public simulations menu'):
            publicSimulationDescriptionBoxPressed();
            break;
    }

    if (!event.ctrlKey) return;

    // if left mousebutton pressed while holding control, attach body to cursor
    if (event.button === 0)
    for (let body of currentSimulation.getBodies()) {
        if (currentSimulation.getCamera().mouseOverlapsBody(body, [mouseX, mouseY])) {
            currentlyDragging = body;
        }
    }
    // if mouse pressed while cursor overlaps popup box, set the currently dragging variable to overlapped popup box
    for (let popupBox of infoPopupBoxes) {
        if (popupBox.mouseOverlapping()) {
            currentlyDragging = popupBox;
        }
    }
    if (updateBodyPopupBox !== -1 && updateBodyPopupBox.mouseOverlapping()) {
        currentlyDragging = updateBodyPopupBox;
    }
}

// q5 library function, run on mouse click
function mouseReleased(event) {
    
    buttonsClicked();

    // maybe swap the order of this, state first then button check
    switch (event.button) {
        // left click
        case 0:
            switch (state) {
                case states.indexOf('main simulation'):  // main simulation
                    // pause & play simulation if clicked icons
                    if (pauseIcon.mouseOverlapping() && currentSimulation.getTimeRate() !== 0) {
                        currentSimulation.setTimeRate(0);
                        break;
                    }
                    if (playIcon.mouseOverlapping() && currentSimulation.getTimeRate() === 0) {
                        currentSimulation.setPrevTimeRate();
                        break;
                    }

                    if (event.ctrlKey) break;

                    // check for click on update body popup
                    // if clicked returns false, linked body is deleted
                    if (updateBodyPopupBox !== -1 && updateBodyPopupBox.mouseOverlapping()) {
                        if (!updateBodyPopupBox.clicked(mouseX, mouseY)) {
                            currentSimulation.getBodies().splice(currentSimulation.getBodies().indexOf(updateBodyPopupBox.getLinkedBody()), 1);
                        }
                        break;
                    }

                    // instantiates a new info popup box if mouse is overlapping body when mouse is pressed
                    // this goes from start to end, results in removing bottom box, reverse for beter ux
                    let addedNewInfoPopup = false;
                    for (let body of currentSimulation.getBodies()) {
                        if (currentSimulation.getCamera().mouseOverlapsBody(body, [mouseX, mouseY])) {
                            infoPopupBoxes.push(new BodyInfoPopupBox(mouseX, mouseY, 400, 250, body, currentSimulation.getCamera(), displayMassUnit, displaySpeedUnit, displayDistanceUnit));
                            addedNewInfoPopup = true;
                        };
                    }
                    if (addedNewInfoPopup) break;

                    // reset when mouse released
                    if (currentlyDragging === -1) {
                        updateBodyPopupBox = -1;
                    }

                    break;
            }
        break;
        // right click
        case 2:
            switch (state) {
                case 0:
                    break;
                case 1:
                    // set updatebodypopup box variable to new popup box or reset if right click on body or not
                    let overlappingBody = false;
                    for (let body of currentSimulation.getBodies()) {
                        if (currentSimulation.getCamera().mouseOverlapsBody(body, [mouseX,mouseY])) {
                            updateBodyPopupBox = new UpdateBodyPopupBox(mouseX, mouseY, 400, 250, body, currentSimulation.getCamera(), displayMassUnit, displaySpeedUnit, displayDistanceUnit);
                            overlappingBody = true;
                            break;
                        }
                    }

                    if (!event.ctrlKey) break;

                    // remove info popup box from popup boxes array on overlapping right click
                    for (let i = infoPopupBoxes.length - 1; i >= 0; i--) {
                        let popupBox = infoPopupBoxes[i];
                        if (popupBox.mouseOverlapping()) {
                            infoPopupBoxes.splice(i, 1);
                            break;
                        }
                    }

                    // create new body if cursor doesn't overlap body and control key is held
                    if (!overlappingBody && event.altKey) {
                        newBodyNumber++;
                        let newBodyName = 'body ' + newBodyNumber;
                        currentSimulation.addBody(new Body(newBodyName, currentSimulation.getCamera().getCursorSimPosition(mouseX,mouseY), [0,0], 0, 0, 0, [random(255), random(255), random(255)]));
                        updateBodyPopupBox = new UpdateBodyPopupBox(mouseX, mouseY, 400, 250, currentSimulation.getBodyByName(newBodyName), currentSimulation.getCamera(), displayMassUnit, displaySpeedUnit, displayDistanceUnit);
                    }
            }

            break;
    }

    currentlyDragging = -1;
    switchSound.stop();
    switchSound.play();
}
// q5 library function, run once when any key pressed
function keyPressed() {
        switch (state) {
        case states.indexOf('main simulation'):  // main simulation
            switch (keyCode) {
                case 27: // escape
                    state = states.indexOf('pause menu');
                    break;
                case 32: // spacebar
                    if (currentSimulation.getTimeRate() !== 0) {
                        currentSimulation.setTimeRate(0);
                    } else {
                        currentSimulation.setPrevTimeRate();
                    }
                    break;
                case 70: //f
                    currentSimulation.setFocusByName(prompt('enter body name to follow'));
                    currentSimulation.getCamera().resetFocusOffset();
                    break;
                case 80: //p
                    let b = currentSimulation.getBodyByName(prompt('enter body name to pan to'));
                    if (!b) break;
                    currentSimulation.getCamera().setPosition(b.getPos());
                case 81: //q -> quick save
                    quickSavedSimulation.setData(JSON.stringify(currentSimulation.getSimulationData()));
                    break; 
                case 76: //l -> quick load
                    currentSimulation.setData(JSON.stringify(quickSavedSimulation.getSimulationData()));
                    break;
            }
            break;
        case states.indexOf('pause menu'):  // pause menu
            if (keyCode === 27) { // escape
                state = states.indexOf('main simulation');
            }
            break;
        case states.indexOf('my simulations menu'):
        case states.indexOf('public simulations menu'):
            switch (keyCode) {
                case 37:
                    loadSimulationIndex = Math.max(0, loadSimulationIndex - 1);
                    break;
                case 39:
                    loadSimulationIndex++;
                    break;
                }

            socket.emit('updateSavedSimulationDescriptionBoxes', currentUserID);
            socket.emit('updatePublicSimulationDescriptionBoxes');
            break;
    }
}


function drawCurrentSimBodies() {
    // display images and ellipse with the given position at the center not top left corner to reduce number of calculations
    imageMode(CENTER);
    ellipseMode(CENTER);

    currentSimulation.moveCameraToFocus();

    // cache current simulation camera and bodies to not call .getCamera(), .getBodies() many times
    let camera = currentSimulation.getCamera();
    let bodies = currentSimulation.getBodies();

    for (let body of bodies) {
        // calculate body position and diameter on canvas using camera object methods
        let canvasPos = camera.getCanvasPosition(body);
        let canvasDiameter = camera.getCanvasDiameter(body);
        let minCanvasDiameter = body.getMinCanvasDiameter();
        if (canvasDiameter < minCanvasDiameter) {
            canvasDiameter = minCanvasDiameter;
        }

        // display ellipse if body has no stored image, else display the image. both at calculated canvas position and diameter
        let bodyImage = body.getImage();
        if (bodyImage === 'none') {
            fill(body.getColour());
            circle(canvasPos[0], canvasPos[1], canvasDiameter);
        } else {
            let img = bodyImages[bodyImage];
            image(img, canvasPos[0], canvasPos[1], canvasDiameter, canvasDiameter);
        }

        if (currentlyDragging instanceof Body && currentlyDragging === body) {
            noFill();
            stroke (255, 255, 150);
            strokeWeight(2);
            circle (canvasPos[0], canvasPos[1], canvasDiameter + 6);
            noStroke();
        }
    }

    // return display modes to default for rest of program 
    imageMode(CORNER); // ask rhys about commenting on this fixed bug 
    ellipseMode(CORNER);
}

function drawToolbar() {
    rectMode(CORNER);
    fill(buttonColourDefault[0], buttonColourDefault[1], buttonColourDefault[2], 100);
    rect(0, height - mainButtonHeight, width, mainButtonHeight);
    rectMode(CENTER);
}

function drawToolbarIcons() {
    imageMode(CENTER);
    for (let icon of icons[states.indexOf('main simulation')]) {
        icon.display();
    }
    imageMode(CORNER);
}

let prevFrameRates = [];
for (let i = 0 ; i < 20; i++) {
    prevFrameRates.push(60);
}

function getAverageFrameRate() {
    let mean = 0;
    for (let i = 0; i < prevFrameRates.length; i++) {
        mean += prevFrameRates[i] * (1 / prevFrameRates.length);
    }
    return mean;
}

function drawCurrentSimToolbar() {
    let simTime = currentSimulation.getTime();
    let simTimeRate = currentSimulation.getTimeRate();
    let camera = currentSimulation.getCamera();
    let cameraPos = camera.getPos();
    let cameraZoom = camera.getZoom();

    // remove first frameRate in array, and shift all others down one index
    prevFrameRates.shift();
    // append current frameRate to array
    prevFrameRates.push(frameRate());
    let averageFrameRate = getAverageFrameRate();

    drawToolbar();
    drawToolbarIcons();
    timeRateTextBox.updateContents("x"+(simTimeRate * averageFrameRate).toPrecision(3));
    timeTextBox.updateContents(secondsToDisplayTime(simTime)); 
    camZoomTextBox.updateContents("x"+cameraZoom.toPrecision(3));
    camPosTextBox.updateContents("( " + cameraPos[0].toPrecision(3) + " , " + cameraPos[1].toPrecision(3) + " )");
}

function mainSimKeyHeldHandler() {
    
    if (keyIsDown('d') || keyIsDown(RIGHT_ARROW)) {
        if (currentSimulation.getFocus())
            currentSimulation.getCamera().updateFocusOffset([3e8/70,0]);
        else
            currentSimulation.getCamera().updatePosition([3e8/70,0]);
    } 
    if (keyIsDown('a') || keyIsDown(LEFT_ARROW)) {
        if (currentSimulation.getFocus())
            currentSimulation.getCamera().updateFocusOffset([-3e8/70,0]);
        else
            currentSimulation.getCamera().updatePosition([-3e8/70,0]);
    }
    if (keyIsDown('w') || keyIsDown(UP_ARROW)) {
        if (currentSimulation.getFocus())
            currentSimulation.getCamera().updateFocusOffset([0,-3e8/70]);
        else
            currentSimulation.getCamera().updatePosition([0,-3e8/70]);
    }
    if (keyIsDown('s') || keyIsDown(DOWN_ARROW)) {
        if (currentSimulation.getFocus())
            currentSimulation.getCamera().updateFocusOffset([0,3e8/70]);
        else
            currentSimulation.getCamera().updatePosition([0,3e8/70]);
    }
}

let zoomInFactor = 1.1;
let zoomOutFactor = 1 / 1.1;
let signFlipThreshold = 0.01;
// q5 library function, run on any scroll wheel event where parameter event is an object containing information about the event.
function mouseWheel(event) {
    let zoomIn = true;
    if (event.delta < 0) {
        zoomIn = false;
    }

    let upFactor = zoomInFactor;
    let downFactor = zoomOutFactor;
    if (keyIsDown('control')) {
        upFactor = 1.01;
        downFactor = 1/1.01;
    }


    switch (state) {
        case 1:  // main simulation
            let currentTimeRate = currentSimulation.getTimeRate();
            if (timeRateTextBox.mouseOverlapping()) { 
                if (currentTimeRate === 0) {
                    if (zoomIn) {
                        currentTimeRate = -1 * signFlipThreshold;
                    } else {
                        currentTimeRate = signFlipThreshold;
                    }
                }
                if (currentTimeRate > 0) {
                    if (zoomIn) { // scroll down 
                        if (currentTimeRate < signFlipThreshold) {
                            currentSimulation.setTimeRate(-1 * currentTimeRate);
                            return;
                        }
                        currentSimulation.updateTimeRate(downFactor);
                    } else { // scroll up
                        currentSimulation.updateTimeRate(upFactor);
                    }
                    break;
                } else {
                    if (zoomIn) { // scroll down 
                        currentSimulation.updateTimeRate(upFactor);
                    } else { // scroll up
                        if (currentTimeRate > -1 * signFlipThreshold) {
                            currentSimulation.setTimeRate(-1 * currentTimeRate);
                            return;
                        }
                        currentSimulation.updateTimeRate(downFactor);
                    }
                    break;
                }
            } 
            if (zoomIn) { // scroll down 
                currentSimulation.getCamera().adjustZoom(downFactor);
            } else { // scroll up
                currentSimulation.getCamera().adjustZoom(upFactor);
            }
            break;
    }
}


let secondsPerMinute = 60;
let secondsPerHour = 60 * secondsPerMinute;
let secondsPerDay = 24 * secondsPerHour;
let secondsPerYear = 365.25 * secondsPerDay;
function secondsToDisplayTime(seconds) {
    let outputText = "";
    let years = Math.floor(seconds / secondsPerYear);
    //if (years == 2026) currentSimulation.setTimeRate(0);
    seconds -= years * secondsPerYear;
    let days = Math.floor(seconds / secondsPerDay);
    seconds -= days * secondsPerDay;
    let hours = Math.floor(seconds / secondsPerHour);
    seconds -= hours * secondsPerHour;
    let minutes = Math.floor(seconds / secondsPerMinute);
    seconds -= minutes * secondsPerMinute;
    outputText += years.toString().padStart(3,'0') + ":" + days.toString().padStart(3,'0') + ":" + hours.toString().padStart(2,'0') + ":" + minutes.toString().padStart(2,'0') + ":" + Math.round(seconds).toString().padStart(2,'0');
    return outputText;
}

function setAccurateYear() {
    let seconds = 0;
    seconds += secondsPerYear * year();
    currentSimulation.setTime(seconds);
}
