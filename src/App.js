import React, { useEffect, useState, useCallback } from "react";
import './App.css';
import { BcdPropIds, DLBarcodeMgr } from './datalogic/dl_barcode';
import { DLKeyboardMgr } from './datalogic/dl_keyboard';
import { configuration } from "./store";


export default function App() {
  const [status, setStatus] = useState("Initialized.")
  const [startButtonDisabled, setStartButtonDisabled] = useState(false)
  const [stopButtonDisabled, setStopButtonDisabled] = useState(false)



  // Enable or disable start and stop buttons
  const enableScanButton = (enable) => {
      setStartButtonDisabled(!enable);
      setStopButtonDisabled(enable);
      }

  // Start button handler
  const startScan = useCallback(() => {
    console.log("start scanning")
      setStatus("Scanning started.");
      document.getElementById('symbology').innerHTML = "&nbsp";
      document.getElementById('data').innerHTML = "&nbsp";
      enableScanButton(false);
      DLBarcodeMgr.startDecode(configuration.SCAN_TIMEOUT);
    }, []);

  // Stop button handler
  const stopScan = useCallback(() => {
    console.log("Stop scanning")
      setStatus("Scanning stopped.");
      enableScanButton(true);
      DLBarcodeMgr.stopDecode();
    }, []);

    // Initializes scanning callbacks
    const initScanning = useCallback(() => {

        // Called when scanning is complete.
        function scanCallback(params) {
          //document.getElementById("symbology").innerHTML = Object.keys(SymIds)[params.id];
          document.getElementById("data").innerHTML = params.text;
          setStatus("Barcode scanned.");
          enableScanButton(true);
        }

        // Called when a scan timeout occurs.
        function timeoutCallback() {
          setStatus("Timeout occurred.");
          enableScanButton(true);
        }
      // Check to see if scanning is initialized
      if (!DLBarcodeMgr.isInitialized()) {
          setStatus("Scanner not initialized!");
          return false;
      }
  
      // Setup the scan callback
      if (!DLBarcodeMgr.onScan(scanCallback)) {
          setStatus("Could not set the scan callback!");
          return false;
      }
  
      // Setup the timeout callback, on failure clear the scan callback
      if (!DLBarcodeMgr.onTimeout(timeoutCallback)) {
          DLBarcodeMgr.ignoreScan();
          setStatus("Could not set the timeout callback!");
          return false;
      }
  
      // Setup unload event so callbacks are removed on unload.
      window.addEventListener('unload', function (event) {
          DLBarcodeMgr.ignoreScan();
          DLBarcodeMgr.ignoreTimeout();
      });
  
      return true;
    }, []);


// Sets the properties for the scanner
function initProperties() {
  DLBarcodeMgr.setProperty(BcdPropIds.WEDGE_KEYBOARD_ENABLE, false);
  DLKeyboardMgr.enableTriggers(true);
}

useEffect(()=>{
  // Disable the scanned data passing to the ui button when it has focus.
  try {
      // If the scanner is not available then display a warning message.
      initProperties();

      document.getElementById("start").addEventListener("click", startScan);
      document.getElementById("stop").addEventListener("click", stopScan);

      // Initialize the scanning, on failure disable the start button
      enableScanButton(true);
      if (!initScanning()) {
          document.getElementById("start").disabled = true;
      }
  } catch (e) {
      if (e instanceof ReferenceError && e.message.includes("_DLBarcodeMgr")) {
          console.error(e)
          console.log("ERROR: DLBarcodeMgr not injected. Barcode scanning functions may not work as expected.");
          alert("Error: DLBarcodeMgr not detected. SDK calls may not work as expected. For full functionality, use a Datalogic mobile scanner and the latest version of Enterprise Browser.");
      }

      if (e instanceof ReferenceError && e.message.includes("_DLKeyboardMgr")) {
          console.error(e)
          console.log("ERROR: DLKeyboardMgr not injected. Barcode scanning functions may not work as expected.");
          alert("Error: DLKeyboardMgr not detected. SDK calls may not work as expected. For full functionality, use a Datalogic mobile scanner and the latest version of Enterprise Browser.");
      }
  }
}, [initScanning, startScan, stopScan]);


  return (
    <div className="App">
      <center>
        <div className="banner">
          datalogic.github.io/javascript/overview/
        </div>
        <h2>Barcode Scanning</h2>
      </center>

      <center>
        <button className="action-button" id="start" disabled={startButtonDisabled} onClick={startScan}>
          Start Scanning
        </button>
        <button className="action-button" id="stop" disabled={stopButtonDisabled} onClick={stopScan}>
          Stop Scanning
        </button>
      </center>

      <hr />
      <div>
        <h3>Status:</h3>
        <div id="status">{status}</div>
      </div>
      <hr />

      <div>
        <h3>Symbology:</h3>
        <div id="symbology">&nbsp</div>
        </div>

        <div>
    <h3>Data:</h3>
    <div id="data">&nbsp</div>
</div>
        </div>
  )
}

