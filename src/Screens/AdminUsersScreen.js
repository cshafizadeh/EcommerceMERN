import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import LoadingBox from '../components/loadingBox';
import MessageBox from '../components/messageBox';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, users: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function AdminUserListScreen() {
  const [{ loading, error, users }, dispatch] = useReducer(reducer, {
    users: [],
    loading: true,
    error: '',
  });

  // eslint-disable-next-line no-unused-vars
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // eslint-disable-next-line no-unused-vars
  const { userInfo } = state;
  const [currentUser, setCurrentUser] = useState({});

  const [toggleDeleteModal, setToggleDeleteModal] = useState(false);
  const [confirmUserDeleteInput, setConfirmUserDeleteInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/users');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [currentUser]);

  const addAdmin = async (user) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { data } = await axios.put(`/api/users/addAdmin/${user._id}`, {
        user,
      });
      dispatch({
        type: 'REQUEST_SUCCESS',
      });
      toast.success('User admin added');
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: err.message });
      toast.error(getError(err));
    }
    setCurrentUser(user);
  };

  const removeAdmin = async (user) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { data } = await axios.put(`/api/users/removeAdmin/${user._id}`, {
        user,
      });
      dispatch({
        type: 'REQUEST_SUCCESS',
      });
      toast.success('User admin removed');
    } catch (err) {
      toast.error(getError(err));
    }
    setCurrentUser(user);
  };

  const deleteUser = (user) => {
    setCurrentUser(user);
    setToggleDeleteModal(true);
  };

  const deleteUserHandler = async (e) => {
    e.preventDefault();
    if (confirmUserDeleteInput === 'CONFIRM') {
      try {
        await axios.delete(`/api/users/admindelete/${currentUser._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setCurrentUser('');
        setConfirmUserDeleteInput('');
        setToggleDeleteModal(false);
      } catch (err) {
        toast.error(getError(err));
      }
    } else {
      toast.error('Invalid Entry');
    }
  };

  return (
    <div style={{ margin: 'unset' }}>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <h1 className="my-3 border-bottom border-dark">Users</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Row className="my-3">
          <table className="table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>CREATED</th>
                <th>ID</th>
                <th>ADMIN</th>
                <th>DELETE</th>
                <th>PERMISSIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="my-3">
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt.substring(0, 10)}</td>
                  <td>{user._id}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => deleteUser(user)}
                      className="bg-danger m-1"
                    >
                      <i class="bi bi-trash"></i>
                    </Button>
                  </td>
                  <td>
                    {user.isAdmin ? (
                      <Button
                        variant="primary"
                        className="bg-warning m-1"
                        onClick={() => removeAdmin(user)}
                      >
                        Remove Admin
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="bg-success m-1"
                        onClick={() => addAdmin(user)}
                      >
                        Make Admin
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Row>
      )}
      <Modal
        size="lg"
        show={toggleDeleteModal}
        onHide={() => setToggleDeleteModal(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Delete User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this product? If yes, please type
          'CONFIRM' in the box below.
          <form onSubmit={deleteUserHandler}>
            <Form.Group className="my-3" controlId="confirmProductDeleteInput">
              <Form.Control
                value={confirmUserDeleteInput}
                onChange={(e) => setConfirmUserDeleteInput(e.target.value)}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button variant="primary" type="submit">
                Delete
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
