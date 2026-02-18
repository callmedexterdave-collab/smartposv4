# SmartPOS Setup & Troubleshooting Guide

## System Requirements
- Node.js (v18 or higher)
- Local Network (Wi-Fi/LAN) for cross-device functionality

## Installation
1. Navigate to the `BudgetManager` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application
1. Start the server:
   ```bash
   npm run dev
   ```
2. The server will display the local network IP address (e.g., `http://192.168.1.x:5000`).

## Cross-Device Access
To access the system from other devices (mobile, tablet):
1. Ensure the device is connected to the **same Wi-Fi network** as the main PC.
2. Open the browser on the mobile device.
3. Enter the URL displayed in the console (e.g., `http://192.168.1.x:5000`).

### Staff Access
- Go to `/staff-login` or click "Staff Login" from the home page.
- Login with your Staff ID and Passkey.
- Status will automatically update to "Online" on the main dashboard.

### Customer Scanner
- Go to `/customer` or use the direct link: `http://192.168.1.x:5000/customer`.
- **Note on Camera:** Modern browsers may block camera access on insecure (HTTP) connections. 
  - If the camera doesn't open, use the "Take Photo Instead" button to capture and scan a barcode image.
  - For full camera stream support, an HTTPS connection (via reverse proxy or tunnel) is recommended.

## Troubleshooting

### "Connection Refused" on Mobile
- Check if the mobile device is on the same network.
- Ensure the PC's firewall is allowing incoming connections on port 5000.
- Verify the IP address hasn't changed.

### Camera Not Working
- Ensure you have granted camera permissions to the browser.
- If using Chrome on Android without HTTPS, use the "Take Photo" fallback option.
- Try using Firefox on Android, which may be more lenient with local HTTP camera access.

### Real-time Updates Not Working
- Check if the server is running.
- Ensure WebSocket connections are not blocked by the network/firewall.
- Refresh the page to reconnect.
