import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState, useRef } from "react";

import volumemeter from "volume-meter";

function App() {
  const [volume, setVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);

  const [rVolume, setRVolume] = useState(0);

  const timerRef = useRef();
  const intervalRef = useRef();
  const volumeRef = useRef(0);

  const queryParams = new URLSearchParams(window.location.search);
  const volumeMultiplier = queryParams.get("v") || 1;

  useEffect(() => {
    getMic((vol) => {
      setVolume(volumeMultiplier * vol);
    });
  }, [volumeMultiplier]);

  useEffect(() => {
    volumeRef.current = volume;
    if (volume > rVolume) {
      setRVolume(volume);
    }
    if (volume > maxVolume) {
      setMaxVolume(volume);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setMaxVolume((curMv) => {
            const fullDist = maxVolume - volumeRef.current;
            const distNow = curMv - volumeRef.current;
            const delta = -distNow ^ (2 + fullDist * distNow);
            return curMv - delta;
          }, 5);
        });
      }, 2500);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [volume, maxVolume, rVolume]);

  return (
    <div className="App">
      <p
        className="CenterText"
        style={{
          color: `rgb(${Math.floor((rVolume / 100) * 255)}, ${Math.floor(
            255 - (rVolume / 100) * 255
          )}, 0)`,
          backgroundColor: `rgba(${Math.floor(
            (rVolume / 100) * 50
          )}, ${Math.floor(50 - (rVolume / 100) * 50)}, 0, 0.5)`,
          borderRadius: "8px",
          minWidth: "2em",
        }}
      >
        {Math.round(rVolume)}
      </p>
      <div className="Inner">
        <div
          style={{
            height: `${volume}%`,
            marginTop: "auto",
            width: "100%",
            backgroundColor: `rgb(${Math.floor(
              (volume / 100) * 255
            )}, ${Math.floor(255 - (volume / 100) * 255)}, 0)`,
          }}
        ></div>
        <div
          style={{
            height: "2px",
            bottom: `${maxVolume}%`,
            width: "100%",
            position: "relative",
            backgroundColor: `rgb(${Math.floor(
              (maxVolume / 100) * 255
            )}, ${Math.floor(255 - (maxVolume / 100) * 255)}, 0)`,
          }}
        ></div>
      </div>
    </div>
  );
}

async function getMic(onVolume) {
  try {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var meter = volumemeter(audioCtx, { fftSize: 2048, tweenIn: 10 }, onVolume);
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    var src = audioCtx.createMediaStreamSource(stream);
    src.connect(meter);
    stream.onended = meter.stop.bind(meter);
    console.log("mic inited");
  } catch (err) {
    console.warn(err);
  }
}

export default App;
