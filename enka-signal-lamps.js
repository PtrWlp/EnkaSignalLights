
const USBRelay = require("@josephdadams/usbrelay");
const relay = new USBRelay(); //gets the first connected relay
// console.log(USBRelay.Relays); //returns an array with HID data including paths

relay.setState(0, false); // relay number 0 references all relays of the device, false is off

const heartbeat = 1000; // milliseconds, determines blink rate
const intervalID = setInterval(setLamps, heartbeat); // heartbeat
var allCombinations = [];
const lampStates = ['0','1','2'];  // off/on/blinking Trinary :-)
const lamps = [1,2,3,4];
InitializeLamps();

function setLamps() {
  let currentTime = new Date();
  let second = (currentTime.getMinutes() * 60) + currentTime.getSeconds();
  let blinkState = (second % 2 == 0);

  // At the whole hour: repopulate the light sequence but begin with All Blinking
  if (second === 0) {
    InitializeLamps();
  } 
  
  // Get the combination that corresponds to the current moment in time: there will fit 97 combinations in 1 hour
  const currentCombination = allCombinations[Math.floor(allCombinations.length/3600*second)];
  lamps.forEach(lamp => {
    const currentLampState = relay.getState(lamp);
    newLampState = currentCombination[lamp-1];
    if (newLampState === '2') {
      // Always blink
      relay.setState(lamp, blinkState);
    }
    if (newLampState === '1' && !currentLampState) {
      // The combination is active for 40 seconds or so. No need for re-setting every second
      relay.setState(lamp, true);
    } 
    if (newLampState === '0' && currentLampState) {
      relay.setState(lamp, false);
    }
  });
}

function InitializeLamps() {
  // Start with all blinking
  allCombinations = [];
  const lampStates = ['0','1','2'];
  lampStates.forEach(lamp1 => {
    lampStates.forEach(lamp2 => {
      lampStates.forEach(lamp3 => {
        lampStates.forEach(lamp4 => {
          const lampCombination = lamp1+lamp2+lamp3+lamp4;
          // For every combination except all-off and all-blinking
          if (!['0000', '2222'].includes(lampCombination)) {
            allCombinations.push(lampCombination);
          }
        });
      });
    });  
  });
  // Shuffle it random 
  for (let i = allCombinations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCombinations[i], allCombinations[j]] = [allCombinations[j], allCombinations[i]];
  }
  // And put ALL-BLINK as first
  allCombinations.unshift('2222');
}


process.on('SIGINT', function() {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  relay.setState(0, false);
  console.log("Exiting...");
  process.exit();
});
