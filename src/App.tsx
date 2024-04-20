import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const videoElement = document.querySelector(
    ".videoElement"
  ) as HTMLVideoElement;
  const outputImg = document.getElementById("outputImg") as HTMLImageElement;
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [takePicture, setTakePicture] = useState(false);

  /* Largely irrelevant Dev stuff*/

  const [displayConstraints, setDisplayConstraints] = useState("");
  const [photoCapabilities, setPhotoCapabilities] = useState("");
  const [trackCapabilities, setTrackCapabilities] = useState("");
  const [facingModeCapas, setFacingModeCapas] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [torchMode, setTorchMode] = useState(false);

  //const [flashMode, setFlashMode] = useState(false);
  const SUPPORTS_MEDIA_DEVICES = "mediaDevices" in navigator;
  if (SUPPORTS_MEDIA_DEVICES) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === "videoinput");

      if (cameras.length === 0) {
        throw "No camera found on this device.";
      }

      setDeviceId(cameras[cameras.length - 1].deviceId);
    });
  }
  //Settings for video & picture modes
  const videoConstraints = {
    video: {
      deviceId: deviceId,
      facingMode: {
        exact: "environment",
      },
      width: { ideal: 720 },
      height: { ideal: 480 },
      exact: ["user", "environment"],
    },
  };

  const toggleTorch = () => setTorchMode(!torchMode);

  const FlashMode = (() => {
    let flm: FillLightMode = "off";

    const _turnOff = () => {
      flm = "off";
    };
    const _turnOn = () => {
      flm = "flash";
    };

    function toggle() {
      if (flm === "flash") {
        _turnOff();
        console.log(flm);
      } else if (flm === "off") {
        _turnOn();
        console.log(flm);
      }
    }
    //const toggle = () => { (fillLightMode === "flash") ? _turnOff() : _turnOn() };

    return { flm, toggle };
  })();

  const takePhoto = () => {
    setTakePicture(true);
  };

  //Irrelevant stuff while Developing
  //const toggleFlash = () => { (flashMode) ? setFlashMode(false) : setFlashMode(true) };
  const getConstraints = () => {
    const supportedConstraints =
      navigator.mediaDevices.getSupportedConstraints();
    let str: string = "";
    for (const constraint of Object.keys(supportedConstraints)) {
      str += `${constraint}, `;
    }
    setDisplayConstraints(str);
  };

  const getActiveConstraints = () => {
    let str: string = "";
    for (const [key, value] of Object.entries(videoConstraints)) {
      str += `${key}: ${value}, `;
    }
    console.log(videoConstraints);
    setDisplayConstraints(str);
  };

  const displayTrackCapabilities = async (track: MediaStreamTrack) => {
    let caps = track.getCapabilities();
    console.log(caps);
    let str = "";

    for (let [key, value] of Object.entries(caps)) {
      str += `${key}: ${value}, `;
    }

    setTrackCapabilities(str);
  };

  const facingModeCaps = async (track: MediaStreamTrack) => {
    let caps = track.getCapabilities();
    let facingMode = caps.facingMode;

    let str = facingMode?.join(", ");
  };

  const displayPhotoCapabilities = async (captureDevice: ImageCapture) => {
    let caps = await captureDevice.getPhotoCapabilities();
    console.log(caps);
    let str = "";

    for (let [key, value] of Object.entries(caps)) {
      str += `${key}: ${value}, `;
    }
    setPhotoCapabilities(str);
  };

  const devicesEnum = () => {
    let camera: any;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === "videoinput");
      //console.log(cameras[0])
      camera = cameras[cameras.length - 1];
    });
    return camera ?? null;
  };

  const camera: any = devicesEnum();

  console.log(camera);

  //Meat of the Component

  useEffect(() => {
    /**Check for a user camera first */
    let hasCamera = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    setCameraEnabled(hasCamera);

    // if (!cameraEnabled) {
    //   return;
    // }

    //ChooseFlash.FlashState.fillLightMode[0]
    //Get user rear facing camera & stream it to videoElement
    navigator.mediaDevices
      .getUserMedia(videoConstraints)
      .then((stream) => {
        videoElement.srcObject = stream;
        //Pass MediaStream Track into ImageCapture API
        const tracks = stream.getVideoTracks();
        let track = stream.getVideoTracks()[0];
        let captureDevice = new ImageCapture(track);

        tracks.forEach((t) => {
          t.applyConstraints({
            advanced: [
              {
                torch: torchMode,
              },
            ],
            torch: torchMode,
          });
        });

        //checks for State (set by take photo button) to utilise API to take photo
        if (takePicture) {
          captureDevice.takePhoto({ fillLightMode: "flash" }).then((blob) => {
            outputImg.src = URL.createObjectURL(blob);
          });
          setTakePicture(false);
        }

        //DEV Stuff Output track/media accessible properties
        displayTrackCapabilities(track);
        facingModeCaps(track);
        displayPhotoCapabilities(captureDevice);
      })
      .catch((err) => {
        console.error(err);
      });
  });

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
        <button type="button" onClick={toggleTorch}>
          Toggle Flash
        </button>
      </div>
      <video
        width={videoConstraints.video.width.ideal}
        height={videoConstraints.video.height.ideal}
        className="videoElement"
        autoPlay
        muted
        playsInline
      ></video>

      <img
        id="outputImg"
        width={videoConstraints.video.width.ideal}
        height={videoConstraints.video.height.ideal}
        src=""
        alt="smile"
      ></img>

      <p>Constraints: {displayConstraints}</p>
      <p>
        Track Caps: <br />
        {trackCapabilities}
      </p>
      <p>
        PhotoCaps: <br />
        {photoCapabilities}
      </p>
      <p>
        Facing Modes: <br />
        {facingModeCapas}
      </p>
    </div>
  );
}
export default App;
