import React from 'react';
import Camera from './Camera';
import './FaceRecognition.css';

class FaceRecognition extends React.Component {
  state = {
    info: [],
    camera: false
  };
  capture(callback) {
    this.camera.capture(callback);
  }

  render() {
    const { imageUrl, streamURL } = this.props;
    const { info, camera } = this.state;
    return (
      <div className="center ma">
        <div className="absolute mt2">
          {imageUrl ? (
            <img
              style={{ maxWidth: 'none' }}
              id="inputimage"
              width="auto"
              alt=""
              src={imageUrl}
              heigh="auto"
            />
          ) : (
            camera && (
              <Camera
                streamURL={streamURL}
                ref={cam => {
                  this.camera = cam;
                }}
              />
            )
          )}

          {info &&
            info.map(({ rect, result }, index) => (
              <div key={index}>
                <div
                  className="bounding-box"
                  style={{
                    top: rect[0],
                    width: rect[1] - rect[3],
                    height: rect[2] - rect[0],
                    left: rect[3]
                  }}
                />
                <small
                  className="label-box"
                  style={{
                    top: rect[2],
                    width: rect[1] - rect[3],
                    left: rect[3]
                  }}
                >
                  {result[0].name} ({(result[0].confidence * 100).toFixed(2)}%)
                </small>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default FaceRecognition;
