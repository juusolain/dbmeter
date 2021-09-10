import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

import volumemeter from "volume-meter";

function App() {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    getMic(setVolume);
  }, []);

  return (
    <div className="App">
      <div className="Inner">
        <p>{volume}</p>
        <div
          style={{
            height: volume,
            bottom: 0,
            width: "100%",
            position: "absolute",
            backgroundColor: "red",
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
