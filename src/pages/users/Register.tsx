import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { USERS_URL } from '../../redux/userSlice';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { addNewUser } from '../../redux/userSlice';
import MuiAlert from '@mui/material/Alert';
const bcrypt = require('bcryptjs');

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImageURL, setProfileImageURL] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch<any>();

  const navigate = useNavigate();

  const preventSpace = (e: any) => {
    if (e.key === ' ') {
      e.preventDefault();
      setErrorMessage('Username cannot contain space');
    }
  };

  const renderErrorMessage = () => {
    if (errorMessage) {
      return (
        <MuiAlert
          elevation={6}
          variant='filled'
          onClose={() => setErrorMessage('')}
          severity='error'
          sx={{ borderRadius: '0.5rem' }}
        >
          {errorMessage}
        </MuiAlert>
      );
    } else {
      return null;
    }
  };

  const usernameError = () => {
    const contains = errorMessage.toLowerCase().includes('username');
    return contains;
  };

  const passwordError = () => {
    const contains = errorMessage.toLowerCase().includes('password');
    return contains;
  };

  const checkIfUsernameExists = async (username: string) => {
    try {
      const response = await axios.get(`${USERS_URL}?username=${username}`);
      if (response.data.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch (error: any) {
      return error.message;
    }
  };

  const onSubmitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setErrorMessage('Required fields cannot be empty!');
      return;
    }

    const isUsernameTaken = await checkIfUsernameExists(username);
    if (isUsernameTaken) {
      setErrorMessage('Username already taken');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password should contain at least 8 characters');
      return;
    }

    if (username.length > 30) {
      setErrorMessage('Username too long');
      return;
    }

    if (password.length > 30) {
      setErrorMessage('Password too long');
      return;
    }

    if (
      profileImageURL &&
      !(
        profileImageURL.includes('.jpg') ||
        profileImageURL.includes('.jpeg') ||
        profileImageURL.includes('.png') ||
        profileImageURL.includes('.gif')
      )
    ) {
      setErrorMessage('URL is invalid, please try another');
      return;
    }

    // add user to database
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: nanoid(),
      username: username,
      password: hashedPassword,
      profilePictureURL: profileImageURL
        ? profileImageURL
        : 'https://t3.ftcdn.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg',
      reactions: [],
    };

    dispatch(addNewUser(newUser));
    navigate('/');
  };

  return (
    <div className='pb-2 max-w-[500px] m-auto'>
      <div className='m-3 sm:m-6 px-4 py-2 bg-[rgb(43,44,45)] rounded-lg'>
        <div className='text-center my-2'>
          <h2 className='ml-0.5 text-xl sm:text-2xl font-bold'>
            Register here
          </h2>
        </div>
        <form onSubmit={(e) => onSubmitRegister(e)}>
          <div className='my-3'>
            <label htmlFor='username' className='block mb-1 ml-0.5'>
              Username<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='username'
              placeholder='Username'
              className={`w-full bg-[rgb(62,63,64)] rounded-lg p-2 sm:text-lg ${
                usernameError() && 'border border-red-500'
              }`}
              onKeyDown={(e) => preventSpace(e)}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className='my-3'>
            <label htmlFor='password' className='block mb-1 ml-0.5'>
              Password<span className='text-red-500'>*</span>
            </label>
            <input
              type='password'
              name='password'
              placeholder='Password'
              className={`w-full bg-[rgb(62,63,64)] rounded-lg p-2 sm:text-lg ${
                passwordError() && 'border border-red-500'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='my-3'>
            <label htmlFor='confirmPassword' className='block mb-1 ml-0.5'>
              Confirm Password<span className='text-red-500'>*</span>
            </label>
            <input
              type='password'
              name='confirmPassword'
              placeholder='Confirm Password'
              className={`w-full bg-[rgb(62,63,64)] rounded-lg p-2 sm:text-lg ${
                passwordError() && 'border border-red-500'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className='mt-3 mb-4'>
            <label htmlFor='image' className='block mb-1 ml-0.5'>
              Profile photo URL (optional)
            </label>
            <input
              type='text'
              name='image'
              className={`w-full bg-[rgb(62,63,64)] rounded-lg p-2 sm:text-lg ${
                errorMessage === 'URL is invalid, please try another' &&
                'border border-red-500'
              }`}
              placeholder='Image URL'
              value={profileImageURL}
              onChange={(e) => setProfileImageURL(e.target.value)}
            />
          </div>
          {renderErrorMessage()}
          <button
            type='submit'
            className='w-full h-10 sm:h-11 text-center bg-green-600 rounded-lg py-2 mt-4 mb-2 disabled:bg-zinc-700 sm:text-lg'
          >
            Register
          </button>
        </form>
      </div>
      <hr className='border-zinc-500 mt-5 mb-4 sm:mt-10 sm:mb-8' />
      <div className='px-4 w-full text-center'>
        <div className='text-lg sm:text-xl'>Already have an account?</div>
        <Link to='/login'>
          <div className='h-10 sm:h-11 p-2 mt-3 mx-3 sm:mx-6 bg-blue-700 rounded-lg sm:text-lg'>
            Log in here
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Register;