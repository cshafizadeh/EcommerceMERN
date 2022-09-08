/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import emailjs from '@emailjs/browser';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function AdminOrderScreen() {
  const form = useRef();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    orders: [],
    loading: true,
    error: '',
  });

  const [shippingModal, setShippingModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    user: '',
    id: '',
    trackingNumber: '',
  });
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/orders/all', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [userInfo.token]);

  useEffect(() => {
    const setOrder = () => {
      setTrackingNumber(currentOrder.trackingNumber);
    };
    setOrder();
  }, [currentOrder]);

  const updateShipping = (order) => {
    setCurrentOrder({
      user: order.user,
      id: order._id,
      trackingNumber: order.trackingNumber,
    });
    setTrackingNumber(currentOrder.trackingNumber);
    setShippingModal(true);
  };

  const confirmTracking = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/orders/tracking/${currentOrder.id}`,
        {
          trackingNumber,
        }
      );
      dispatch({
        type: 'REQUEST_SUCCESS',
      });
      setShippingModal(false);
      toast.success('Order tracking updated successfully');
    } catch (err) {
      dispatch({
        type: 'REQUEST_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Admin Orders</title>
      </Helmet>
      <h1 className="mb-3 border-bottom border-dark">Orders</h1>
      <Row>
        <Col md={12}>
          <ListGroup>
            {orders.map((order) => (
              <ListGroupItem key={order._id}>
                <Row className="align-items-center">
                  <Col md={4}>Order #: {order._id}</Col>
                  <Col md={2}>
                    <Link className="mx-3" to={`/order/${order._id}`}>
                      Details →
                    </Link>
                  </Col>
                  <Col md={2}>
                    Price: <strong>${order.totalPrice}</strong>
                  </Col>
                  <Col md={1}>
                    <span
                      className={
                        order.isPaid
                          ? 'badge badge-success bg-success'
                          : 'badge badge-danger bg-danger'
                      }
                    >
                      {order.isPaid ? 'Paid' : 'Not Paid'}
                    </span>
                  </Col>
                  <Col md={2}>
                    <span
                      className={
                        order.isDelivered
                          ? 'badge badge-success bg-success'
                          : 'badge badge-danger bg-danger'
                      }
                    >
                      {order.isDelivered ? 'Delivered' : 'Not Delivered'}
                    </span>
                  </Col>
                  <Col md={1}>
                    <Button
                      className="m-1 border border-dark bg-warning"
                      onClick={() => updateShipping(order)}
                    >
                      <i className="bi bi-truck" style={{ color: 'black' }}></i>
                    </Button>
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <Modal
        size="lg"
        show={shippingModal}
        onHide={() => setShippingModal(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Add Tracking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tracking number for order.
          <form ref={form} onSubmit={confirmTracking}>
            <Form.Group className="my-3" controlId="confirmProductDeleteInput">
              <Form.Control
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                name="test"
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button variant="success" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
