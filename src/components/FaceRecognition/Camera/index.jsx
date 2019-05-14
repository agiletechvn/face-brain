import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MJPEG from './MJPEG';

class Camera extends Component {
  mediaStream = null;

  updateStream(callback) {
    if (!this.mediaStream) {
      const { video, audio, streamURL } = this.props;
      console.log(navigator.mediaDevices);
      if (streamURL) {
        var player = new MJPEG.Player(this.canvas, streamURL);
        player.start();
        const mediaStream = this.canvas.captureStream(24);
        this.mediaStream = mediaStream;
        callback(this.mediaStream);
        // console.log(mediaStream);
      } else if (navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia({ video: {} })
          .then(mediaStream => {
            this.mediaStream = mediaStream;
            callback(this.mediaStream);
            this.video.srcObject = mediaStream;
            this.video.play();
          })
          .catch(error => error);
      }
    } else {
      callback(this.mediaStream);
    }
  }

  capture(callback) {
    this.updateStream(mediaStream => {
      if (this.props.streamURL) {
        this.canvas.toBlob(callback);
        return;
      }

      const mediaStreamTrack = mediaStream.getVideoTracks()[0];
      const imageCapture = new window.ImageCapture(mediaStreamTrack);
      imageCapture.takePhoto().then(callback);
      // console.log(photo);
      // return photo;
    });
  }

  render() {
    const { streamURL } = this.props;

    return (
      <div style={this.props.style}>
        {this.props.children}

        {streamURL ? (
          <canvas
            ref={canvas => {
              this.canvas = canvas;
            }}
            style={{ background: '#000' }}
            width={800}
            height={600}
          >
            {' '}
            Your browser sucks.
          </canvas>
        ) : (
          <video
            ref={video => {
              this.video = video;
            }}
            style={{ background: '#000' }}
          />
        )}
      </div>
    );
  }
}

Camera.propTypes = {
  audio: PropTypes.bool,
  video: PropTypes.bool,
  children: PropTypes.element,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Camera.defaultProps = {
  audio: false,
  video: true,
  style: {},
  children: null
};

export default Camera;

const styles = {
  base: {
    width: '100%',
    height: '100%'
  }
};
