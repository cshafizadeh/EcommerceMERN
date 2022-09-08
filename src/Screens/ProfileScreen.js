import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils.js';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [deleteButton, setDeleteButton] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // eslint-disable-next-line no-unused-vars
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'REQUEST_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('User info updated successfully');
    } catch (err) {
      dispatch({
        type: 'REQUEST_FAIL',
      });
      toast.error(getError(err));
    }
  };

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/';
  };

  const deleteAccount = (e) => {
    setDeleteButton(!deleteButton);
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    if (deleteConfirm === 'CONFIRM') {
      try {
        await axios.delete(`/api/users/delete/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        signoutHandler();
      } catch (err) {
        toast.error(getError(err));
      }
    } else {
      toast.error('Invalid Entry');
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3">User Profile</h1>
      <div className="my-3 border-bottom border-dark">
        <h3>Name: {userInfo.name}</h3>
        <h3>Email: {userInfo.email}</h3>
        <div className="mb-3">
          <Link to="/orderhistory">Orders</Link>
        </div>
      </div>
      <h3 className="my-3">Update Profile</h3>
      <form onSubmit={submitHandler} className="border-bottom border-dark">
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Update</Button>
        </div>
      </form>
      <div className="my-3 text-center">
        <Button onClick={(e) => deleteAccount(e.target.value)}>
          Delete Account
        </Button>
      </div>
      {deleteButton ? (
        <Modal.Dialog className="my-2" style={{ zIndex: '10' }}>
          <Modal.Header
            closeButton
            onClick={(e) => setDeleteButton(!deleteButton)}
          >
            <Modal.Title>
              Are you sure you want to delete your account?
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={confirmDelete}>
            <Modal.Body>
              <p>
                If you want to delete your account, type 'CONFIRM' in the space
                below
              </p>
              <Form.Group className="mb-3" controlId="fullName">
                <Form.Control
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <div className="mb-3">
                <Button variant="primary" type="submit">
                  Yes, I want to delete my account.
                </Button>
              </div>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      ) : (
        <></>
      )}
    </div>
  );
}
