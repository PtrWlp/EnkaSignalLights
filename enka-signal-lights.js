const USBRelay = require("@josephdadams/usbrelay");
let relay;

try {
  relay = new USBRelay(); //gets the first connected relay
  } catch (error) {
    // MOCK FOR RELAY
  let currentState = ['-', '-', '-', '-'];
  relay = {
    setState(relay, state) {
      const prevState = currentState.join('');
      if (relay === 0) {
        currentState = ['-', '-', '-', '-'];
      } else {
        currentState[relay-1] = state ? '@' : '-';
        if (prevState !== currentState.join('') && currentState.join('') !== '----') {
          console.log(currentState.join(''));
        }
      }
    },
    getState(relay) {
      return currentState[relay-1] !== '-';
    }
  };
}

relay.setState(0, false); // relay number 0 references all relays of the device, false is off

const lampStates = ['0','1','2'];  // off/on/blinking Trinary :-)
const lamps = [1,2,3,4];

const heartbeat = 500; // milliseconds, determines blink rate
let fireAlarm = 0; // Start with fire alarm
let currentTick = 0; // start with fire-alarm
var allCombinations = [];

InitializeLamps();
const numberOfHartbeatsPerHour = 3600*1000/heartbeat;
const numberOfHeartbeatsPerCombination = numberOfHartbeatsPerHour/allCombinations.length;

// Start the heartbeat
const intervalID = setInterval(setLamps, heartbeat);

function setLamps() {
  const currentTime = new Date();
  const second = (currentTime.getMinutes() * 60) + currentTime.getSeconds();

  const blinkState = (second % 2 == 1); // Start with blink ON, evaluate avery second

  // Get the combination that corresponds to the current moment in time: there will fit 97 combinations in 1 hour
  const currentCombination = allCombinations[Math.floor(currentTick/numberOfHeartbeatsPerCombination)];

  // At the whole hour: repopulate the light sequence but begin with All Blinking
  if (second === 0) {
    InitializeLamps(); // Reshuffle the sequence
    fireAlarm = 0; // At the full hour, indicate fire Alarm for half a minute
    currentTick = 0;
  } 
  
  // At startup, overrule the currentCombination (which is a random entry in the array) with ALL_BLINK for 6 seconds
  if (fireAlarm < 32) { // Half a minute of fire alarm
    // FireAlarm is alternating every lamp.
    fireAlarm++;
    relay.setState(0, false);
    relay.setState(((fireAlarm - 1) % 4) + 1, true); // One of the 4 on
  } else {
    lamps.forEach(lamp => {
      const currentLampState = relay.getState(lamp);
      newLampState = currentCombination[lamp-1]; // Array start with 0, lamp starts with 1
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
  currentTick++;
}

function InitializeLamps() {
  allCombinations = [];
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
}


process.on('SIGINT', function() {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  relay.setState(0, false);
  console.log("Exiting...");
  process.exit();
});
