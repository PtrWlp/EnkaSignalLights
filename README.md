# EnkaSignalLights
mimick the Signal lights at the old ENKA factory

sudo apt-get update
sudo apt-get install git
git clone https://github.com/PtrWlp/EnkaSignalLights.git
cd EnkaSignalLights
sudo apt-get install nodejs
sudo apt-get install npm
npm i

// Set the rights to the hardware
cp ./50-usbrelay.rules  /etc/udev/rules.d
sudo udevadm control -R


// Register the app as a systemd service
sudo cp ./enka-signal-lights.service /etc/systemd/system
sudo systemctl enable enka-signal-lights.service
// To start manually, run sudo systemctl start enka-signal-lights.service

sudo cp ./stop /usr/local/bin/
sudo chmod +x /usr/local/bin/stop

To stop the service, run sudo systemctl stop enka-signal-lights, 
or plain sudo stop


Wires and connections:
Red lamp => Red wire => plug 6
Blue lamp => Brown wire => plug 2
Green lamp => Green wire => plug 4
Yellow lamp ( for led; combined red and green ) => yellow wire => plug 1
Ground or Min ( black) => White wire => plug 3

