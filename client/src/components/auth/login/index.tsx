import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 */
const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('login');

  return (
    <div className='container'>
      <div className='cde-header'>
        <h1 className='cde-logo-box'>
          <span className='block c'>C</span>
          <span className='block d'>D</span>
          <span className='block e'>E</span>
        </h1>
      </div>
      <h3>Please login to continue.</h3>
      <form onSubmit={handleSubmit}>
        <h4>Please enter your username.</h4>
        <input
          type='text'
          value={username}
          onChange={event => handleInputChange(event, 'username')}
          placeholder='Enter your username'
          required
          className='input-text'
          id='username-input'
        />
        <h4>Please enter your password.</h4>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={event => handleInputChange(event, 'password')}
          placeholder='Enter your password'
          required
          className='input-text'
          id='password-input'
        />
        <div className='show-password'>
          <input
            type='checkbox'
            id='showPasswordToggle'
            checked={showPassword}
            onChange={togglePasswordVisibility}
          />
          <label htmlFor='showPasswordToggle'>Show Password</label>
        </div>
        <button type='submit' className='login-button'>
          Submit
        </button>
      </form>
      {err && <p className='error-message'>{err}</p>}
      <Link to='/signup' className='signup-link'>
        Don&apos;t have an account? Sign up here.
      </Link>
    </div>
  );
};

export default Login;
