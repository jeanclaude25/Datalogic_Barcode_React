import React, { useState, useCallback } from "react";
import { useSnapshot } from "valtio";
import "./App.css";
import InitScan from "./Components/initScan";
import { DLBarcodeMgr } from "./datalogic/dl_barcode";
import { configuration } from "./store";

export default function App() {
  const [status, setStatus] = useState("Initialized.");
  const [startButtonDisabled, setStartButtonDisabled] = useState(false);
  const [stopButtonDisabled, setStopButtonDisabled] = useState(false);
  const snap = useSnapshot(configuration);
  const [scanned, setScanned] = useState([]);
  const [symbValue, setSymbValue] = useState("");
  const [dataValue, setDataValue] = useState("");

  const receiveData = (data) => {
    console.log(data);
    if (data.dataValue) setDataValue(data.dataValue);
    if (data.symbValue) setSymbValue(data.symbValue);
    if (data.status) setStatus(data.status);
    if (data.scanButton) enableScanButton(data.scanButton);
    if (data.disableStartButton) startButtonDisabled(data.disableStartButton);
  };

  //
  const displayScans = () => {
    const scans = localStorage.getItem("scans");

    if (scans) {
      const parsedScans = JSON.parse(scans);
      setScanned(parsedScans);
    } else {
      setScanned([]);
    }
  };

  // Enable or disable start and stop buttons
  const enableScanButton = (enable) => {
    setStartButtonDisabled(!enable);
    setStopButtonDisabled(enable);
  };

  // Start button handler
  const startScan = useCallback(() => {
    console.log("start scanning");
    setStatus("Scanning started.");
    setSymbValue("&nbsp");
    setDataValue("&nbsp");
    enableScanButton(false);
    DLBarcodeMgr.startDecode(configuration.SCAN_TIMEOUT);
  }, []);

  // Stop button handler
  const stopScan = useCallback(() => {
    console.log("Stop scanning");
    setStatus("Scanning stopped.");
    enableScanButton(true);
    DLBarcodeMgr.stopDecode();
  }, []);

  return (
    <>
      <InitScan props={receiveData} />
      <div className="App">
        <center>
          {snap.SCAN_IS_HERE ? (
            <>
              You are on a Scanner device
              <br />
              <button
                className="action-button"
                id="start"
                disabled={startButtonDisabled}
                onClick={startScan}
              >
                Start Scanning
              </button>
              <button
                className="action-button"
                id="stop"
                disabled={stopButtonDisabled}
                onClick={stopScan}
              >
                Stop Scanning
              </button>
              <hr />
              <div>
                <h3>Status:</h3>
                <div id="status">{status}</div>
              </div>
              <hr />
              <div>
                <h3>Symbology:</h3>
                <div id="symbology">{symbValue}</div>
              </div>
              <div>
                <h3>Data:</h3>
                <div id="data">{dataValue}</div>
              </div>
            </>
          ) : (
            <>
              You are on a computer
              <br />
              <input type="text"></input>
            </>
          )}
        </center>

        <div>
          <button className="displayScan" onClick={displayScans}>
            Get scanned data
          </button>
          <h3>Liste des scans :</h3>
          {scanned.length > 0 ? (
            <ul>
              {scanned.map((scan, index) => (
                <li key={index}>
                  {scan.symbology} - {scan.data} - {scan.timestamp}
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun scan trouvé dans le localStorage.</p>
          )}
        </div>
      </div>
    </>
  );
}
