import { useState, useRef, useEffect, MutableRefObject } from "react";
import "./App.css";

function App() {
  const videoElement = useRef(
    null
  ) as MutableRefObject<HTMLVideoElement | null>;

  const outputImg = document.getElementById("outputImg") as HTMLImageElement;
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [takePicture, setTakePicture] = useState(false);

  /* Largely irrelevant Dev stuff*/
  const [text, setText] = useState("");
  const [torchables, setTorchables] = useState("");
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
        ideal: "environment",
      },
      torch: { ideal: true },
      width: { ideal: 720 },
      height: { ideal: 480 },
      //exact: ["user", "environment"],
    },
  };

  const toggleTorch = () => setTorchMode(!torchMode);

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

  // const getActiveConstraints = () => {
  //   let str: string = "";
  //   for (const [key, value] of Object.entries(videoConstraints)) {
  //     str += `${key}: ${value}, `;
  //   }
  //   console.log(videoConstraints);
  //   setDisplayConstraints(str);
  // };

  // const displayTrackCapabilities = async (track: MediaStreamTrack) => {
  //   let caps = track.getCapabilities();
  //   console.log(caps);
  //   let str = "";

  //   for (let [key, value] of Object.entries(caps)) {
  //     str += `${key}: ${value}, `;
  //   }

  //   setTrackCapabilities(str);
  // };

  // const facingModeCaps = async (track: MediaStreamTrack) => {
  //   let caps = track.getCapabilities();
  //   let facingMode = caps.facingMode;

  //   let str = facingMode?.join(", ");
  // };

  // const displayPhotoCapabilities = async (captureDevice: ImageCapture) => {
  //   let caps = await captureDevice.getPhotoCapabilities();
  //   console.log(caps);
  //   let str = "";

  //   for (let [key, value] of Object.entries(caps)) {
  //     str += `${key}: ${value}, `;
  //   }
  //   setPhotoCapabilities(str);
  // };

  // const devicesEnum = () => {
  //   let camera: any;
  //   navigator.mediaDevices.enumerateDevices().then((devices) => {
  //     const cameras = devices.filter((device) => device.kind === "videoinput");
  //     //console.log(cameras[0])
  //     camera = cameras[cameras.length - 1];
  //   });
  //   return camera ?? null;
  // };

  // const camera: any = devicesEnum();

  // console.log(camera);

  //Meat of the Component

  const torchWork = async () => {
    // if (!!!navigator.mediaDevices) {
    //   return;
    // }

    const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);

    if (videoElement.current) {
      videoElement.current.srcObject = stream;
    }

    const tracks = stream.getVideoTracks();

    const devices = tracks.filter((x) => x.getCapabilities());
    setText(devices.length.toString());

    await devices[0].applyConstraints({
      torch: true,
      advanced: [
        {
          torch: true,
        },
      ],
    });

    const captureDevice = new ImageCapture(devices[0]);

    if (takePicture) {
      captureDevice.takePhoto({ fillLightMode: "flash" }).then((blob) => {
        outputImg.src = URL.createObjectURL(blob);
      });
      setTakePicture(false);
    }
  };

  useEffect(() => {
    torchWork();
  }, [torchMode, takePicture]);

  return (
    <div className="App">
      <div>
        Devices = {text}
        <button type="button" onClick={getConstraints}>
          Log Supported Constraints
        </button>
        <button type="button">Log Active Constraints</button>
        <button type="button" onClick={takePhoto}>
          Take Photo
        </button>
        <button type="button" onClick={toggleTorch}>
          Toggle Flash
        </button>
      </div>
      <video
        ref={videoElement}
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
