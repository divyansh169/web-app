import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import MainMenu from './components/MainMenu';
import ChooseOne from './components/ChooseOne';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword'; // Ensure you import this if you use it
import TabNavigation from './components/TabNavigation';
import Home from './components/Home';
import Cart from './components/Cart';
import Order from './components/Order';
import Track from './components/Track';
import Profile from './components/Profile';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/chooseone" element={<ChooseOne />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/tabs" element={<TabNavigation />}>
        <Route path="home" element={<Home />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order" element={<Order />} />
        <Route path="track" element={<Track />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  </Router>
);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
