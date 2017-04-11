# nodeMonitor
Node JS unix like system monitor and notification tools

### Features:

 - Monitor usage volume(login/connected events)
 - Telegram notification
 - Custom notification content format
 - Allow you to add/write modules
 
### Install:
#### In debian 8.x:
 - Copy all `.js` files into location you want
 - Edit&copy `systemd/nodeMonitor.service` to `/etc/systemd/system/`
 - Run $ `systemctl start nodeMonitor` to start as a service
 - Run $ `systemctl enable nodeMonitor` to auto start service after reboot
