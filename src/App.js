import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

const initialState = {
  input: '',
  // imageUrl: 'http://192.168.10.90/mjpg/1/video.mjpg',
  imageUrl: '',
  route: 'home',
  isSignedIn: true,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    this.running = false;
    this.baseURL = 'http://' + window.location.hostname + ':5000';
  }

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  componentDidMount() {
    this.detect();
  }

  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = box => {
    this.setState({ box: box });
  };

  onInputChange = event => {
    console.log(event);
    this.setState({ input: event.target.value });
  };

  onRouteChange = route => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  detect = () => {
    if (!this.running) {
      return setTimeout(this.detect, 1000);
    }
    this.face.capture(file => {
      // console.log(file);
      const formData = new FormData();
      formData.set('file', file, file.name);
      // formData.set('size', 200);
      fetch(this.baseURL + '/search_file', {
        // Your POST endpoint
        method: 'POST',
        body: formData
      })
        .then(
          response => response.json() // if the response is a JSON object
        )
        .then(info => {
          this.face.setState({ info });
          this.detect();
        })
        .catch(error => {
          console.log(error); // Handle the error response object
          return setTimeout(this.detect, 2000);
        });
    });
  };

  handleCamera = async event => {
    this.running = !this.running;
    this.face.setState({ camera: this.running });
    if (!this.running) {
      setTimeout(() => this.face.setState({ info: [] }), 1000);
    }
  };

  handleFileChange = async event => {
    this.running = false;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.set('file', file, file.name);
    // formData.set('jitter', 100);
    fetch(this.baseURL + '/search_file', {
      // Your POST endpoint
      method: 'POST',
      body: formData
    })
      .then(
        response => response.json() // if the response is a JSON object
      )
      .then(info => {
        this.setState({ imageUrl: URL.createObjectURL(file) });
        this.face.setState({ info });
      })
      .catch(
        error => console.log(error) // Handle the error response object
      );
  };

  render() {
    const { isSignedIn, imageUrl, route } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <div style={{ marginTop: 50 }}>
          <input
            id="myFileUpload"
            type="file"
            onChange={this.handleFileChange}
            accept=".jpg, .jpeg, .png"
          />

          <button onClick={this.handleCamera}>Camera</button>

          <FaceRecognition
            // streamURL="http://192.168.10.90/mjpg/1/video.mjpg"
            ref={face => (this.face = face)}
            imageUrl={imageUrl}
          />
        </div>
      </div>
    );
  }
}

export default App;
