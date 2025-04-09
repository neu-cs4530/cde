import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  return (
    <div id='header' className='header'>
      <div className='header-left'>
        <div className='cde-logo-container'>
          <div className='cde-logo'>
            <span className='cde-letter cde-c'>C</span>
            <span className='cde-letter cde-d'>D</span>
            <span className='cde-letter cde-e'>E</span>
          </div>
        </div>
      </div>
      <div className='header-center'>
        <input
          id='searchBar'
          placeholder='Search Questions...'
          type='text'
          value={val}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='header-right'>
        <button onClick={handleSignOut} className='logout-button'>
          Log out
        </button>
        <button
          className='view-profile-button'
          onClick={() => navigate(`/user/${currentUser.username}`)}>
          <FaUserCircle style={{ marginRight: '6px' }} />
          Profile
        </button>
      </div>
    </div>
  );
};

export default Header;
