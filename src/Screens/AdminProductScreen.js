/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getError } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Store } from '../Store';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function AdminProductScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [lgShow, setLgShow] = useState(false);
  const [lgShowDelete, setLgShowDelete] = useState(false);
  const [addProductLgShow, setAddProductLgShow] = useState(false);

  const [confirmProductDeleteInput, setConfirmProducDeleteInput] = useState('');

  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    image: '',
    category: '',
    price: 0,
    brand: '',
    countInStock: '',
    description: '',
  });

  const [newProductName, setNewProductName] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductStock, setNewProductStock] = useState(0);
  const [newProductRating, setNewProductRating] = useState(3);
  const [newProductNumReviews, setNewProductNumReviews] = useState(0);

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState();
  const [brand, setBrand] = useState('');
  const [countInStock, setCountInStock] = useState();
  const [description, setDescription] = useState('');

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [products]);

  useEffect(() => {
    const setProduct = () => {
      setName(currentProduct.name);
      setImage(currentProduct.image);
      setCategory(currentProduct.category);
      setPrice(currentProduct.price);
      setBrand(currentProduct.brand);
      setCountInStock(currentProduct.countInStock);
      setDescription(currentProduct.description);
    };
    setProduct();
  }, [currentProduct]);

  const editProduct = (product) => {
    setCurrentProduct(product);
    setLgShow(true);
  };

  const deleteProduct = (product) => {
    setCurrentProduct(product);
    setLgShowDelete(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const editedProduct = {
      name,
      image,
      category,
      price,
      brand,
      countInStock,
      description,
    };
    try {
      const { data } = await axios.put(
        '/api/products/edit',
        {
          currentProduct,
          editedProduct,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'REQUEST_SUCCESS',
      });
      setLgShow(false);
      toast.success('Product info updated successfully');
    } catch (err) {
      dispatch({
        type: 'REQUEST_FAIL',
      });
      toast.error(getError(err));
    }
  };

  const deleteProductHandler = async (e) => {
    e.preventDefault();
    if (confirmProductDeleteInput === 'CONFIRM') {
      try {
        await axios.delete(
          `/api/products/delete/${currentProduct._id}`,
          {
            currentProduct,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('Product removed successfully');
        setLgShowDelete(false);
        setConfirmProducDeleteInput('');
      } catch (err) {
        toast.error(getError(err));
      }
    } else {
      toast.error('Invalid Entry');
    }
  };

  const addProductHandler = async (e) => {
    e.preventDefault();
    const newProduct = {
      newProductName,
      newProductImage,
      newProductBrand,
      newProductPrice,
      newProductDescription,
      newProductCategory,
      newProductNumReviews,
      newProductRating,
      newProductStock,
    };
    try {
      await axios.post('/api/products/create', {
        newProduct,
      });
      toast.success('Product added successfully');
      setAddProductLgShow(false);
      navigate('/admin/productlist');
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
        <title>Admin Product Page</title>
      </Helmet>
      <h1 className="mb-3 border-bottom border-dark">Products</h1>
      <Row>
        <Col md={12}>
          <ListGroup>
            {products.map((product) => (
              <ListGroupItem key={product._id}>
                <Row className="align-items-center">
                  <Col md={3}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="img-fluid rounded img-thumbnail"
                    ></img>{' '}
                    <Link className="mx-3" to={`/product/${product.slug}`}>
                      {product.name}
                    </Link>
                  </Col>
                  <Col md={2}>
                    Brand: <strong>{product.brand}</strong>
                  </Col>
                  <Col md={1}>
                    Price: <strong>${product.price}</strong>
                  </Col>
                  <Col md={1}>
                    Stock: <strong>{product.countInStock}</strong>
                  </Col>
                  <Col md={2}>
                    Category: <strong>{product.category}</strong>
                  </Col>
                  <Col md={2}>Description: {product.description}</Col>
                  <Col md={1}>
                    <Button
                      className="m-1 bg-warning border border-dark"
                      onClick={() => editProduct(product)}
                    >
                      <i class="bi bi-pencil" style={{ color: 'black' }}></i>
                    </Button>
                    <Button
                      className="m-1 border border-dark"
                      onClick={() => deleteProduct(product)}
                    >
                      <i class="bi bi-trash" style={{ color: 'black' }}></i>
                    </Button>
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Col>
        <Modal
          size="lg"
          show={lgShow}
          onHide={() => setLgShow(false)}
          aria-labelledby="example-modal-sizes-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
              Edit Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={submitHandler}
              className="border-bottom border-dark"
            >
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="image">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="price">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  value={price}
                  type="number"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="brand">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="countInStock">
                <Form.Label>Left in stock</Form.Label>
                <Form.Control
                  type="number"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>
              <div className="mb-3">
                <Button variant="warning" type="submit">
                  Edit
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
        <Modal
          size="lg"
          show={lgShowDelete}
          onHide={() => setLgShowDelete(false)}
          aria-labelledby="example-modal-sizes-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
              Delete Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this product? If yes, please type
            'CONFIRM' in the box below.
            <form onSubmit={deleteProductHandler}>
              <Form.Group
                className="my-3"
                controlId="confirmProductDeleteInput"
              >
                <Form.Control
                  value={confirmProductDeleteInput}
                  onChange={(e) => setConfirmProducDeleteInput(e.target.value)}
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
      </Row>
      <div className="addItemButtonContainer">
        <button
          className="addItemButton"
          onClick={() => setAddProductLgShow(true)}
          style={{
            float: 'right',
            backgroundColor: 'transparent',
            border: 'none',
          }}
        >
          <i className="addProductButtonIcon bi bi-plus-circle color-secondary"></i>
        </button>
      </div>
      <Modal
        size="lg"
        show={addProductLgShow}
        onHide={() => setAddProductLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Add Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={addProductHandler}
            className="border-bottom border-dark"
          >
            <Form.Group className="mb-3" controlId="newProductName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newProductImage">
              <Form.Label>Image (url link)</Form.Label>
              <Form.Control
                value={newProductImage}
                onChange={(e) => setNewProductImage(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newProductBrand">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                value={newProductBrand}
                onChange={(e) => setNewProductBrand(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newProductCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newProductPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newProductDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newProductStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button variant="success" type="submit">
                Add Product
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
