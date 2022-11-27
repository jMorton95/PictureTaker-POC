import { useState, useRef, useEffect } from 'react';
import './App.css';


function App() {
  const videoElement = (document.querySelector(".videoElement") as HTMLVideoElement);
  const outputImg = document.getElementById('outputImg') as HTMLImageElement;
  const [takePicture, setTakePicture] = useState(false);

  /* Largely irrelevant Dev stuff*/
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [displayConstraints, setDisplayConstraints] = useState('');
  const [photoCapabilities, setPhotoCapabilities] = useState('');
  const [trackCapabilities, setTrackCapabilities] = useState('');
  const [facingModeCapas, setFacingModeCapas] = useState('');
  
  //const [flashMode, setFlashMode] = useState(false);

  
  //Settings for video & picture modes
  const videoConstraints = { 
    width: 720,
    height: 480,
    video: {
      facingMode: {
        exact: "environment"
      }
    }
  };

  const FlashMode = (() => {

    let fillLightMode: FillLightMode = "off";

    const _turnOff = () => { fillLightMode = "off" };
    const _turnOn = () => {fillLightMode = "flash" };

    const toggle = () => { (fillLightMode === "flash") ? _turnOff : _turnOn };

    return {fillLightMode, toggle}
  })();

  const takePhoto = () => {
    setTakePicture(true);
  }


  //Irrelevant stuff while Developing
  //const toggleFlash = () => { (flashMode) ? setFlashMode(false) : setFlashMode(true) };
  const getConstraints = () => {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    let str: string = '';
    for (const constraint of Object.keys(supportedConstraints)) {
      str += `${constraint}, `;
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

    let str = facingMode?.join(', ');
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

  const devicesEnum = async () => {
    let devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
  }

  

  //Meat of the Component

  useEffect(() => {
    /**Check for a user camera first */
    let hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setCameraEnabled(hasCamera);

    if (!cameraEnabled) {
      return;
    }
    //ChooseFlash.FlashState.fillLightMode[0]
    //Get user rear facing camera & stream it to videoElement
    navigator.mediaDevices.getUserMedia(videoConstraints)
      .then((stream) => {
          videoElement.srcObject = stream;
          //Pass MediaStream Track into ImageCapture API
          let track = stream.getVideoTracks()[0];
          let captureDevice = new ImageCapture(track);

          //checks for State (set by take photo button) to utilise API to take photo
          if (takePicture) {
            captureDevice.takePhoto({fillLightMode: FlashMode.fillLightMode})
            .then((blob) => {
                outputImg.src = URL.createObjectURL(blob);
            });
            setTakePicture(false);
          }

          //Output track/media accessible properties
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
        <button type="button" onClick={takePhoto}>
          Take Photo
        </button>
        <button type="button" onClick={FlashMode.toggle}>Toggle Flash</button>
      </div>
      <video width={videoConstraints.width} height={videoConstraints.height} className="videoElement" autoPlay muted playsInline></video>

      <img id="outputImg" width={videoConstraints.width} height={videoConstraints.height} src='' alt='smile'></img>

      <p>Constraints: {displayConstraints}</p>
      <p>Track Caps: <br/>
         {trackCapabilities}
         </p>
      <p>PhotoCaps: <br/>
         {photoCapabilities}
      </p>
      <p>Facing Modes: <br/>
        {facingModeCapas}
      </p>
    </div>
  )
}

export default App
