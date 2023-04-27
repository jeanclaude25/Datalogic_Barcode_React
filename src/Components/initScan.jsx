import { useEffect } from "react"
import { DLBarcodeMgr } from "../datalogic/dl_barcode";
import { DLKeyboardMgr } from "../datalogic/dl_keyboard";



export default function InitScan(){
    
  // Initializes scanning callbacks
  function initScanning() {
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
    addEventListener('unload', function (event) {
        DLBarcodeMgr.ignoreScan();
        DLBarcodeMgr.ignoreTimeout();
    });

    return true;
}

// Called when scanning is complete.
function scanCallback(params) {
    document.getElementById("symbology").innerHTML = Object.keys(SymIds)[params.id];
    document.getElementById("data").innerHTML = params.text;
    setStatus("Barcode scanned.");
    enableScanButton(true);
}

// Called when a scan timeout occurs.
function timeoutCallback() {
    setStatus("Timeout occurred.");
    enableScanButton(true);
}

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
                    },[])

    return(
            <>
            
            </>
            )
}