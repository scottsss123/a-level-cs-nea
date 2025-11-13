// import libraries required to connect users to server and manage database
const sqlite3 = require('sqlite3');
var express = require('express');
var socket = require('socket.io');
const { emit } = require('process');
const { resolve } = require('path');
const { fileURLToPath } = require('url');

const db = new sqlite3.Database('spaceSimulationDB.db');

// send connected users the public folder containing script.js
var app = express();
app.use(express.static('public'));

var server = app.listen(3000, () => {
    console.log('server running');
})

// setup input/output connection with user 
var io = socket(server);
io.on('connection', connected);

// log serverside user socket id
function connected(socket) {
    console.log(socket.id + " has connected");

    // enable client to call insertNewUser() on server
    socket.on('signupUser', (data) => { signupUser(data) });
    socket.on('loginUser', (data) => { loginUser(data) });
    // log usernames and/or password hashes to serverside terminal
    socket.on('logUsernames', () => { logUsernames() });
    socket.on('logPasswordHashes', () => { logPasswordHashes() });
    socket.on('logUsers', () => {logUsers()});

    socket.on('logdata', (data) => {
        console.log(data);
    })

    socket.on('insertSimulation', (data) => { insertSimulation(data); });
    socket.on('saveSettings', (data) => { saveSettings(data); });
    socket.on('loadSettings', (data) => { loadSettings(data); });
    socket.on('saveSimulation', (data) => { saveSimulation(data); });
    socket.on('saveAsSimulation', (data) => { saveAsSimulation(data); });
    socket.on('loglastuserid', () => { loglastuserid(); })
    socket.on('setCurrentSimulationByID', (ID) => {setCurrentSimulationByID(ID); });
    socket.on('updateSavedSimulationDescriptionBoxes', (ID) => {updateSavedSimulationDescriptionBoxes(ID); });
    socket.on('loadSimulationByID', (ID) => { loadSimulationByID(ID); });
    socket.on('updatePublicSimulationDescriptionBoxes', () => { updatePublicSimulationDescriptionBoxes(); });
    socket.on('deleteSimulationByID', (data) => { deleteSimulationByID(data); });
}

// log db usernames to serverside console
function logUsernames() {
    let sql = "SELECT Username FROM Users;";
    console.log("sql:", sql);

    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
        }
    })
}

// log db passwordhashes to serverside console
function logPasswordHashes() {
    let sql = "SELECT PasswordHash FROM Users;";
    console.log('sql:', sql);

    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
        }
    })
}

function logUsers() {
    let sql = "SELECT * FROM Users;";
    console.log('sql:', sql);

    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
        }
    })
}

function getUsers() {
    let sql = "SELECT * FROM Users;";
    console.log("sql:", sql);

    return new Promise((resolve) => {
        db.all(sql, (err,rows) => {
            if (err) {
                console.log(err);
            } else {
                resolve(rows);
            }
        })
    })
}

function insertSimulation(data) { // UserID, SimulationJSON, IsPublic
    let userID = data.userID;
    let simulationJSON = data.simulationJSON;
    let isPublic = data.isPublic;

    let sql = "INSERT INTO Simulations (UserID, Simulation, IsPublic) VALUES ('" + userID + "','"+simulationJSON+"','"+isPublic+"');";
    //console.log("sql:", sql);

    db.all(sql, (err) => {
        if (err) {
            console.log(err);
            io.emit('alert', 'error saving simulation');
        } else {
            io.emit('alert', 'simulation saved successfully');
        }
    })
}

// method to insert new user into spaceSimulationDB
// data = { username: string, passwordHash: string }
async function signupUser(data) {
    let username = data.username;
    let passwordHash = data.passwordHash;

    let users = await getUsers();

    let usernameExists = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].Username === username) {
            usernameExists = true;
        }
    }

    if (usernameExists) {
        io.emit('alert', 'Username already exists, try a logging in or a different username');
        return;
    }

    sql = "INSERT INTO Users (Username, PasswordHash) VALUES ('"+username+"','"+passwordHash+"');";
    console.log(sql);

    // execut sql and log any sql errors
    db.all(sql, async (err) => {
        if (err) {
            console.log(err);
            io.emit('alert', 'Signup error: ' + err);
        } else {
            io.emit('alert', "User '" + username + "' created");
            let lastUserID = await getLastUserID();
            io.emit('setUser', {username: username, userID: lastUserID});
        }
    })
}

async function loginUser(data) {
    let username = data.username;
    let passwordHash = data.passwordHash;

    let users = await getUsers();
    let userID;
    
    let usernameExists = false;
    let userPasswordHash = "";
    for (let i = 0; i < users.length; i++) {
        //console.log(users[i]);
        if (users[i].Username === username) {
            usernameExists = true;
            userID = users[i].UserID;
            userPasswordHash = users[i].PasswordHash;
        }
    }

    if (!usernameExists) {
        io.emit("alert", "Username does not exist, try signing up to create new user");
        return;
    } 

    if (passwordHash !== userPasswordHash) {
        io.emit("alert", "Password does not match user's password, try again");
        return;
    }

    io.emit("alert", "Log in successful\nCurrent user: " + username);
    io.emit("setUser", { userID : userID, username: username });
}

function getSettings() {
    let sql = "SELECT * FROM Settings;";
    console.log("sql:", sql);

    return new Promise((resolve) => {
        db.all(sql, (err,rows) => {
            if (err) {
                console.log(err);
            } else {
                resolve(rows);
            }
        })
    })
}

async function saveSettings(data) { // data = { userID: int, volume: 0/1, lengthUnit: str, massUnit: str, speedUnit: str }
    let userID = data.userID;
    let volume = data.volume;
    let lengthUnit = data.lengthUnit;
    let massUnit = data.massUnit;
    let speedUnit = data.speedUnit;

    if (!volume) {
        volume = 1;
    }

    if (userID <= 0) {
        io.emit('alert', "must be logged in to save settings, visit profile menu");
        return;
    }

    let settingsExists = false;

    let settings = await getSettings();
    for (let i = 0; i < settings.length; i++) {
        if (settings[i].UserID === userID) {
            settingsExists = true;
        }
    }

    if (!settingsExists) {

        let sql = "INSERT INTO Settings (UserID, Volume, LengthUnit, MassUnit, SpeedUnit) VALUES (" + userID + ", " + volume + ", '" + lengthUnit + "', '" + massUnit+"', '" + speedUnit + "');";
        console.log("sql:", sql);
        // execut sql and log any sql errors
        db.all(sql, (err) => {
            if (err) {
                console.log(err);
                io.emit('alert', 'settings save error: ' + err);
            } else {
                io.emit('alert', " settings saved for the first time");
            }
        });
        
        return;
    }

    let sql = "UPDATE Settings SET Volume = " + volume + ", LengthUnit = '" + lengthUnit + "', MassUnit = '" + massUnit + "', SpeedUnit = '" + speedUnit + "' WHERE UserID = " + userID + ";";
    console.log(sql);
    // execut sql and log any sql errors
    db.all(sql, (err) => {
        if (err) {
            console.log(err);
            io.emit('alert', 'settings save error: ' + err);
        } else {
            io.emit('alert', " settings saved");
        }
    });
}

async function loadSettings(data) { // data = {userID: int}
    let settings = await getSettings();
    for (let i = 0; i < settings.length; i++) {
        if (settings[i].UserID === data.userID) {
            io.emit('loadSettings', { volume: settings[i].Volume, lengthUnit: settings[i].LengthUnit, massUnit: settings[i].MassUnit, speedUnit: settings[i].SpeedUnit });
            io.emit('alert', "settings loaded successfully");
            return;
        }
    }
    io.emit('alert', 'settings failed to load, try logging in');
}

function getSimulationMetaDatas() {
    let sql = "SELECT UserID, SimulationID, IsPublic, Name, Description FROM Simulations;";
    // console.log("sql:", sql);

    return new Promise((resolve) => {
        db.all(sql, (err,rows) => {
            if (err) {
                console.log(err);
            } else {
                resolve(rows);
            }
        })
    })
}

async function saveSimulation(data) {
    // id of simulation & attached user to be saved, must exist 
    let simulationID = data.simulationID;
    let userID = data.userID;
    let simulationString = data.simulationString;
    // isPublic, name, description, may be empty strings, if so these remain unchanged in table
    let isPublic = data.isPublic;
    let name = data.name;
    let description = data.description;

    // get simulation to be saved's existing value of IsPublic, Name and Description
    let simulationMetaDatas = await getSimulationMetaDatas();
    let currentSimulationMetaData;
    for (let i = 0; i < simulationMetaDatas.length; i++) {
        if (simulationMetaDatas[i].SimulationID === simulationID) {
            currentSimulationMetaData = simulationMetaDatas[i];
        }
    }
    if (!currentSimulationMetaData) {
        console.log('uh oh :('); // fix this before documenting
    }

    if (!isPublic) {
        isPublic = currentSimulationMetaData.IsPublic
    } else if (isPublic !== 'y') {
        isPublic = 0;
    } else {
        isPublic = 1;
    }
    if (!name) {
        name = currentSimulationMetaData.Name;
    }
    if (!description) {
        description = currentSimulationMetaData.description;
    }

    // save simulation

    let sql = "UPDATE Simulations SET UserID = " + userID + ", Simulation = '" + simulationString + "', IsPublic = " + isPublic + ", Name = '" + name + "', Description = '" + description + "' WHERE SimulationID = " + simulationID + ";";
    console.log(sql);
    db.all(sql, (err) => {
        if (err) {
            console.log(err);
        } else {
            io.emit('alert', 'simulation saved successfully');
        }
    })
}

function getLastSimulationId() {
    let sql = "SELECT SimulationID FROM Simulations;";
    console.log("sql:", sql);

    return new Promise((resolve) => {
        db.all(sql, (err,rows) => {
            if (err) {
                console.log(err);
            } else {
                resolve(rows[rows.length - 1].SimulationID);
            }
        })
    })
}

function getLastUserID() {
    let sql = "SELECT UserID FROM Users;";
    console.log("sql:", sql);

    return new Promise((resolve) => {
        db.all(sql, (err,rows) => {
            if (err) {
                console.log(err);
            } else {
                console.log(rows[rows.length -1].UserID);
                resolve(rows[rows.length - 1].UserID);
            }
        })
    })
}

async function saveAsSimulation(data) { // data = { userID: int , simulationString: str, isPublic: int (1/0), name: str, description: str }
    
    let userID = data.userID;
    let simulationString = data.simulationString;
    let isPublic = data.isPublic;
    let name = data.name;
    let description = data.description;

    let sql = "INSERT INTO Simulations (UserID, Simulation, IsPublic, Name, Description) VALUES (" + userID + ", '" + simulationString + "', " + isPublic + ", '" + name+"', '" + description + "');";
    //console.log("sql:", sql);

    db.all(sql, (err) => {
        if (err) {
            console.log(err);
            io.emit('alert', 'simulation save as error: ' + err);
        } else {
            io.emit('alert', "simulation successfullty saved\nname: " + name);
        }
    });

    let lastSimulationID = await getLastSimulationId();
    io.emit('setCurrentSimulationID', lastSimulationID);
    io.emit('log', lastSimulationID);
}

function getSimulationByID(ID) {
    let sql = "SELECT * FROM Simulations WHERE SimulationID = " + ID;

    return new Promise((resolve) => {
        db.all(sql, (err,rows) => {
            if (err) {
                console.log(err);
            } else {
                //console.log(rows);
                resolve(rows[0]);
            }
        })
    })
}

async function setCurrentSimulationByID(ID) {
    let simulationData = await getSimulationByID(ID);
    let outData = simulationData.Simulation;
    io.emit('setCurrentSimulation', outData);
}

//  send user's simulations' meta datas to the client
async function updateSavedSimulationDescriptionBoxes(ID) {
    let simulationMetaDatas = await getSimulationMetaDatas();
    let userSimulationMetaDatas = [];

    for (let simulationMetaData of simulationMetaDatas) {
        if (simulationMetaData.UserID === ID) {
            userSimulationMetaDatas.push(simulationMetaData);
        }
    }

    console.log('meta datas: ' , userSimulationMetaDatas);


    io.emit('updateSavedSimulationDescriptionBoxes', userSimulationMetaDatas);
}

//  send public simulations' meta datas to the client
async function updatePublicSimulationDescriptionBoxes() {
    let simulationMetaDatas = await getSimulationMetaDatas();
    let publicSimulationMetaDatas = [];

    for (let simulationMetaData of simulationMetaDatas) {
        if (simulationMetaData.IsPublic === 1) {
            publicSimulationMetaDatas.push(simulationMetaData);
        }
    }

    console.log('meta datas: ', publicSimulationMetaDatas);

    io.emit('updatePublicSimulationDescriptionBoxes', publicSimulationMetaDatas);
}

async function loadSimulationByID(ID) {
    
    let simulationData = await getSimulationByID(ID);
    
    io.emit('setCurrentSimulation', simulationData.Simulation);
    
}

async function deleteSimulationByID(data) {
    console.log('trying to delete',data.simulationID);

    let sql = "DELETE FROM Simulations WHERE SimulationID = " + data.simulationID + ";";
    db.all(sql, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('simulation id: ' + data.simulationID + " deleted");
            io.emit('alert', 'simulation id: ' + data.simulationID + ' deleted');
            updateSavedSimulationDescriptionBoxes(data.userID);
        }
    })
}
