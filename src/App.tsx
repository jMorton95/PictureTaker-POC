import { useState, useRef, useEffect } from 'react';
import './App.css';


function App() {
  const videoElement = (document.querySelector(".videoElement") as HTMLVideoElement);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [displayConstraints, setDisplayConstraints] = useState('');
  const [photoCapabilities, setPhotoCapabilities] = useState('');
  const [trackCapabilities, setTrackCapabilities] = useState('');
  const [facingModeCapas, setFacingModeCapas] = useState('');
  
  const videoConstraints = { 
    width: 720,
    height: 480,
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
  

  const displayTrackCapabilities = async (track: MediaStreamTrack) => {
    let caps = track.getCapabilities();
    console.log(caps);
    let str = '';

    for (let [key, value] of Object.entries(caps)){
      str += `${key}: ${value}, `;
    }
  
    setTrackCapabilities(str);
  }

  const facingModeCaps = async (track: MediaStreamTrack) => {
    let caps = track.getCapabilities();
    let facingMode = caps.facingMode;

    let str = facingMode?.forEach(str => str);
  }
  
  
  const displayPhotoCapabilities = async (captureDevice: ImageCapture) => {
    let caps = await captureDevice.getPhotoCapabilities();
    console.log(caps);
    let str = '';
  
    for (let [key, value] of Object.entries(caps)){
      str += `${key}: ${value}, `;
    }
  
    setPhotoCapabilities(str);
  }

  useEffect(() => {
    /**Check for a user camera first */
    let hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setCameraEnabled(hasCamera);
    
    
    navigator.mediaDevices.getUserMedia(videoConstraints)
      .then((stream) => {
          let track = stream.getVideoTracks()[0];
          
        let caps = track.getCapabilities();
        console.log(caps);

          videoElement.srcObject = stream;
          
          let captureDevice = new ImageCapture(track);

          const getEm = () => captureDevice.getPhotoCapabilities();
          console.log(getEm());
          displayTrackCapabilities(track);
          facingModeCaps(track);
          displayPhotoCapabilities(captureDevice);
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
      <video width={videoConstraints.width} height={videoConstraints.height} className="videoElement" autoPlay muted playsInline></video>
      <p>Constraints: {displayConstraints}</p>
      <p>Track Caps: {trackCapabilities}</p>
      <p>PhotoCaps: {photoCapabilities} </p>
      <p>Facing Modes: {facingModeCapas}</p>
    </div>
  )
}

export default App
