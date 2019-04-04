import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import AnnouncementBar from './announcement-bar';

class App extends Component {
  render() {
    return (
      <div className="App">
        <AnnouncementBar />
      </div>
    );
  }
}

export default App;
