import { useState, useRef, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';


function App() {
  const videoElement = (document.querySelector(".videoElement") as HTMLVideoElement);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoConstraints = { 
      width: 720,
      height: 480,
      video: true,
      audio: true,
      torch: true
     };
     
  const getConstraints = () => {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    for (const constraint of Object.keys(supportedConstraints)) {
      console.log(constraint);
    }
  }

  const getActiveConstraints = () => {
    console.log(videoConstraints)
  }


 useEffect(() => {
  /**Check for a user camera first */
    let hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setCameraEnabled(hasCamera);

    navigator.mediaDevices.getUserMedia(videoConstraints)
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };

        let [track] = stream.getVideoTracks();
        let capabilities = track.getCapabilities();
        console.log(capabilities);
        let captureDevice = new ImageCapture(track);
        const photoCapabilities = () =>  captureDevice.getPhotoCapabilities();
        
        console.log(photoCapabilities);
      })
      .catch((err) => {
        console.error(err);
      });
})

  return (
    <div className="App">
      <div>
        <button onClick={getConstraints}>
          Log Supported Constraints
        </button>
        <button onClick={getActiveConstraints}>
          Log Active Constraints
          </button>
      </div>
      <video className="videoElement" autoPlay></video>
    </div>
  )
}

export default App
