import { useState, useRef, useEffect } from 'react';
import './App.css';


function App() {
  const videoElement = (document.querySelector(".videoElement") as HTMLVideoElement);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [displayConstraints, setDisplayConstraints] = useState('');

  const videoConstraints = { 
      // width: 720,
      // height: 480,
      video: true,
      torch: true,
      facingMode: { exact: "environment" }
     };
     
  const getConstraints = () => {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    let str: string = '';
    for (const constraint of Object.keys(supportedConstraints)) {
      str += `${constraint}, `;
      console.log(constraint);
    }
    setDisplayConstraints(str);
  }

  const getActiveConstraints = () => {
    let str: string = '';
    for (const [key, value] of Object.entries(videoConstraints)) {
      str += `${key}: ${value}, `;
    }
    console.log(videoConstraints);
    setDisplayConstraints(str);
  }


 useEffect(() => {
  /**Check for a user camera first */
    let hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setCameraEnabled(hasCamera);

    navigator.mediaDevices.getUserMedia(videoConstraints)
      .then((stream) => {
        let track = stream.getVideoTracks()[1];
        track.applyConstraints(videoConstraints);

        videoElement.srcObject = stream;
        track.applyConstraints(videoConstraints);

        let capabilities = track.getCapabilities();
        console.log(capabilities);
        let captureDevice = new ImageCapture(track);
        
        const photoCapabilities = () =>  captureDevice.getPhotoCapabilities();
        
      })
      .catch((err) => {
        console.error(err);
      });
})
  return (
    <div className="App">
      <div>
        <button type="button" onClick={getConstraints}>
          Log Supported Constraints
        </button>
        <button type="button" onClick={getActiveConstraints}>
          Log Active Constraints
          </button>
      </div>
      <video className="videoElement" autoPlay muted playsInline></video>
      <p>Constraints: {displayConstraints}</p>
      <p></p>
    </div>
  )
}

export default App
