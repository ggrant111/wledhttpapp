document.getElementById('wledForm').addEventListener('submit', function(event){
    event.preventDefault();

    const ipAddress = document.getElementById('ipAddress').value;
    const params = {
        A: document.getElementById('brightness').value,
        CL: document.getElementById('color').value.replace('#', ''),
        SX: document.getElementById('speed').value,
        IX: document.getElementById('intensity').value
    };

    updateDevice(ipAddress, params);
});

function updateDevice(ipAddress, params) {
    if(!ipAddress) {
        alert("Please enter the device IP address.");
        return;
    }

    let url = `http://${ipAddress}/win`;
    Object.keys(params).forEach(key => {
        if (params[key] ) {
            url += `&${key}=${params[key]}`;
        }
    });

    // document.getElementById('httpRequestDisplay').innerText = `${url}`;
    sendRequest(url);
}

function sendRequest(url) {
    console.log('Sending HTTP Request:', url); // Log the URL to the console
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(str => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(str, "text/xml");
            updateDeviceState(xml); // Update the device state display
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function fetchAndDisplayDeviceState() {
    const ipAddress = document.getElementById('ipAddress').value; // Ensure this input exists and is populated
    if (!ipAddress) {
        console.log("IP Address is not specified.");
        return;
    }
    
    let url = `http://${ipAddress}/win`; // Modify according to how your API returns the current state
    sendRequest(url); // Assumes sendRequest processes the response and updates the state display
}

function mapValueToRange(value) {
    const maxOriginalRange = 255;
    const maxNewRange = 10;
    return Math.round((value / maxOriginalRange) * maxNewRange);
}

function updateDeviceState(xml) {
    const deviceStateDiv = document.getElementById('deviceState');
    const ac = xml.querySelector('ac').textContent;
    const fxID = xml.querySelector('fx').textContent; // This is the effect ID
    const sx = xml.querySelector('sx').textContent; // Speed
    const ix = xml.querySelector('ix').textContent; // Intensity
    const ds = xml.querySelector('ds').textContent; // Description
    const fp = xml.querySelector('fp').textContent; // Palette
    

    // Find the effect name using the effect ID
    const fxName = effectsList.find(effect => effect.id.toString() === fxID)?.name || "Unknown Effect";
    // Find the palette name using the palette ID
    const fpName = palettesList.find(palette => palette.id.toString() === fp)?.name || "Unknown Palette";
    // Assuming 'A' represents the brightness in the XML (replace 'A' with the correct tag as necessary)
    const brightnessValue = xml.querySelector('ac').textContent;
    const speedValue = xml.querySelector('sx').textContent;
    const intensityValue = xml.querySelector('ix').textContent;
    // Map the 0-255 brightness value to a 0-10 range
    const mappedBrightness = mapValueToRange(parseInt(brightnessValue, 10));
    const mappedSpeed = mapValueToRange(parseInt(speedValue, 10));
    const mappedIntensity   = mapValueToRange(parseInt(intensityValue, 10));
    // Construct a user-friendly representation of the device state
    const htmlContent = `
        <h3>Device State:</h3>
        
        <p>Brightness: ${mappedBrightness}</p>
        <p>Effect: ${fxName}</p>
        <p>Speed: ${mappedSpeed}</p>
        <p>Intensity: ${mappedIntensity}</p>
        <p>Description: ${ds}</p>
        <p>Palette: ${fpName}</p>
    `;

    // Update the HTML of the device state div
    deviceStateDiv.innerHTML = htmlContent;
}

function updateParameterValue(parameter, value) {
    const ipAddress = document.getElementById('ipAddress').value;
    if(!ipAddress) {
        alert("Please enter the device IP address.");
        return;
    }

    let params = {};
    params[parameter] = value;
    updateDevice(ipAddress, params);
}

// Event listeners for brightnesscontrols
document.getElementById('decreaseBrightness').addEventListener('click', function() {
    updateParameterValue('A', '~-10');
});
document.getElementById('pauseBrightness').addEventListener('click', function() {
    updateParameterValue('T', '2');
});
document.getElementById('increaseBrightness').addEventListener('click', function() {
    updateParameterValue('A', '~10');
});

// Event listeners for effect controls
document.getElementById('prevEffect').addEventListener('click', function() {
    updateParameterValue('FX', '~-');
});
document.getElementById('randomEffect').addEventListener('click', function() {
    updateParameterValue('FX', 'r');
});
document.getElementById('nextEffect').addEventListener('click', function() {
    updateParameterValue('FX', '~');
});

// Event listeners for speed controls
document.getElementById('increaseEffectSpeed').addEventListener('click', function() {
    updateParameterValue('SX', '~10');
});
document.getElementById('decreaseEffectSpeed').addEventListener('click', function() {
    updateParameterValue('SX', '~-10');
});
document.getElementById('pauseEffectSpeed').addEventListener('click', function() {
    updateParameterValue('SX', '0');
});

// Event listeners for intensity controls
document.getElementById('increaseIntensity').addEventListener('click', function() {
    updateParameterValue('IX', '~10');
});
document.getElementById('decreaseIntensity').addEventListener('click', function() {
    updateParameterValue('IX', '~-10');
});
document.getElementById('pauseIntensity').addEventListener('click', function() {
    updateParameterValue('IX', '0');
});

// Event listeners for palette controls
document.getElementById('nextpalette').addEventListener('click', function() {
    updateParameterValue('FP', '~');
});
document.getElementById('prevpalette').addEventListener('click', function() {
    updateParameterValue('FP', '~-');
});
document.getElementById('randompalette').addEventListener('click', function() {
    updateParameterValue('FP', 'r');
});

// Placeholder for effectsList - replace with actual fetched data
let effectsList = [];

// Function to fetch effects data from the JSON file
function fetchEffectsData() {
    fetch('regenerated_effects_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // parse the JSON data from the response
        })
        .then(data => {
            effectsList = data; // Store the effects data for later use
        })
        .catch(error => {
            console.error('Error fetching effects data:', error);
        });
}

let palettesList = []; // This will hold the fetched palettes data

function fetchPalettesData() {
    fetch('palettes.json') // Replace with the correct path to the JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // parse the JSON data from the response
        })
        .then(data => {
            palettesList = data.palettes; // Store the palettes data for later use
        })
        .catch(error => {
            console.error('Error fetching palettes data:', error);
        });
}

// Call the function to fetch the data when the script loads
fetchPalettesData();

// Call the function to fetch the data when the script loads
fetchEffectsData();

fetchAndDisplayDeviceState();
