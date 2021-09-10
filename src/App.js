import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState, useRef } from "react";

import volumemeter from "volume-meter";

function App() {
  const [volume, setVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);

  const timerRef = useRef();
  const intervalRef = useRef();
  const volumeRef = useRef(0);

  useEffect(() => {
    getMic(setVolume);
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
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
            let distBot = curMv - volumeRef.current;
            let distTop = maxVolume - curMv;
            if (distTop <= 1) distTop = 1;
            if (distBot <= 1) distBot = 1;
            console.log(distTop, distBot);
            if (distTop < distBot) {
              return curMv - distTop / 50;
            } else {
              return curMv - distBot / 50;
            }
          }, 5);
        });
      }, 2500);
    }
  }, [volume, maxVolume]);

  return (
    <div className="App">
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
    src.connect(audioCtx.destination);
    stream.onended = meter.stop.bind(meter);
    console.log("mic inited");
  } catch (err) {
    console.warn(err);
  }
}

export default App;
