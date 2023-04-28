import { useCallback, useEffect } from "react";
import { BcdPropIds, DLBarcodeMgr, SymIds } from "../datalogic/dl_barcode";
import { DLKeyboardMgr } from "../datalogic/dl_keyboard";

export default function InitScan(props) {
  // Initializes scanning callbacks
  const initScanning = useCallback(() => {
    // Called when scanning is complete.
    const scanCallback = (params) => {
      // Enregistrez le scan dans le localStorage
      const scanData = {
        symbology: Object.keys(SymIds)[params.id],
        data: params.text,
        timestamp: new Date().toISOString(),
      };

      let scans = localStorage.getItem("scans");
      if (scans) {
        scans = JSON.parse(scans);
      } else {
        scans = [];
      }

      scans.push(scanData);
      localStorage.setItem("scans", JSON.stringify(scans));

      // Mettez à jour l'interface utilisateur avec les données scannées
      props.receiveData({
        dataValue: params.text,
        status: "Barcode scanned.",
        scanButton: true,
      });
    };

    // Called when a scan timeout occurs.
    const timeoutCallback = () => {
      props.receiveData({
        status: "Timeout occurred.",
        scanButton: true,
      });
    };

    // Check to see if scanning is initialized
    if (!DLBarcodeMgr.isInitialized()) {
      props.receiveData({
        status: "Scanner not initialized!",
      });
      return false;
    }

    // Setup the scan callback
    if (!DLBarcodeMgr.onScan(scanCallback)) {
      props.receiveData({
        status: "Could not set the scan callback!",
      });
      return false;
    }

    // Setup the timeout callback, on failure clear the scan callback
    if (!DLBarcodeMgr.onTimeout(timeoutCallback)) {
      DLBarcodeMgr.ignoreScan();
      props.receiveData({
        status: "Could not set the timeout callback!",
      });

      return false;
    }

    // Setup unload event so callbacks are removed on unload.
    window.addEventListener("unload", (event) => {
      DLBarcodeMgr.ignoreScan();
      DLBarcodeMgr.ignoreTimeout();
    });

    return true;
  }, [props]);

  const initProperties = () => {
    DLBarcodeMgr.setProperty(BcdPropIds.WEDGE_KEYBOARD_ENABLE, false);
    DLKeyboardMgr.enableTriggers(true);
  };

  useEffect(() => {
    try {
      initProperties();
      props.receiveData({ scanButton: true });
      if (!initScanning()) {
        props.receiveData({ disableStartButton: true });
      }
    } catch (e) {
      if (e instanceof ReferenceError && e.message.includes("_DLBarcodeMgr")) {
        console.error(e);
        console.log(
          "ERROR: DLBarcodeMgr not injected. Barcode scanning functions may not work as expected."
        );
        alert(
          "Error: DLBarcodeMgr not detected. SDK calls may not work as expected. For full functionality, use a Datalogic mobile scanner and the latest version of Enterprise Browser."
        );
      }

      if (e instanceof ReferenceError && e.message.includes("_DLKeyboardMgr")) {
        console.error(e);
        console.log(
          "ERROR: DLKeyboardMgr not injected. Barcode scanning functions may not work as expected."
        );
        alert(
          "Error: DLKeyboardMgr not detected. SDK calls may not work as expected. For full functionality, use a Datalogic mobile scanner and the latest version of Enterprise Browser."
        );
      }
    }
  }, [initScanning, props]);

  return <></>;
}
