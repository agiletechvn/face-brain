import React from 'react';
import Camera from './Camera';
import './FaceRecognition.css';

class FaceRecognition extends React.Component {
  state = {
    info: [],
    camera: false,
    scale: 1,
    minConfidence: 0.75
  };
  capture(callback) {
    this.camera.capture(callback);
  }

  onLoad = e => {
    const img = document.querySelector('#inputimage');
    this.setState({ scale: img.width / img.naturalWidth });
  };

  render() {
    const { imageUrl, streamURL } = this.props;
    const { info, camera, scale, minConfidence } = this.state;
    // console.log(this.scale);
    return (
      <div className="center ma">
        <div className="absolute mt2">
          {imageUrl ? (
            <img
              style={{ maxWidth: '100%' }}
              id="inputimage"
              onLoad={this.onLoad}
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
            info.map(({ rect, landmarks, detected }, index) => (
              <div key={index}>
                <div
                  className="bounding-box"
                  style={{
                    left: rect[0] * scale,
                    top: rect[1] * scale,
                    width: (rect[2] - rect[0]) * scale,
                    height: (rect[3] - rect[1]) * scale
                  }}
                />
                <small
                  className="label-box"
                  style={{
                    left: rect[0] * scale,
                    top: rect[1] * scale,
                    width: (rect[2] - rect[0]) * scale
                  }}
                >
                  {detected.confidence > minConfidence
                    ? `${detected.name} (${(detected.confidence * 100).toFixed(
                        2
                      )}%)`
                    : 'unknown'}
                </small>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default FaceRecognition;
