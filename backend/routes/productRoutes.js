import express, { query } from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

const PAGE_SIZE = 3;
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.delete(
  '/delete/:id',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.status(200).send('Product successfully deleted');
    } else {
      res.status(400).send('Product deletion failed');
    }
  })
);

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product not found' });
  }
});

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product not found' });
  }
});

productRouter.put(
  '/edit',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const editedProduct = req.body.editedProduct;
    const product = await Product.findById(req.body.currentProduct._id);
    if (product) {
      product.name = editedProduct.name;
      product.image = editedProduct.image;
      product.category = editedProduct.category;
      product.price = editedProduct.price;
      product.brand = editedProduct.brand;
      product.countInStock = editedProduct.countInStock;
      product.description = editedProduct.description;

      const updatedProduct = await product.save();
      res.send({
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        image: updatedProduct.image,
        category: updatedProduct.category,
        price: updatedProduct.price,
        brand: updatedProduct.brand,
        countInStock: updatedProduct.countInStock,
        description: updatedProduct.description,
        rating: updatedProduct.rating,
        numReviews: updatedProduct.numReviews,
      });
    } else {
      res.status(401).send('There was an issue processing this request');
    }
  })
);

productRouter.post(
  '/create',
  expressAsyncHandler(async (req, res) => {
    const newProductData = req.body.newProduct;
    const newProductSlug = newProductData.newProductName.replace(/ /g, '-');
    console.log(newProductSlug);
    const newProduct = new Product({
      name: newProductData.newProductName,
      slug: newProductSlug,
      image: newProductData.newProductImage,
      brand: newProductData.newProductBrand,
      category: newProductData.newProductCategory,
      description: newProductData.newProductDescription,
      price: newProductData.newProductPrice,
      countInStock: newProductData.newProductStock,
      rating: newProductData.newProductRating,
      numReviews: newProductData.newProductNumReviews,
    });
    const product = await newProduct.save();
    res.status(200).send('Successfully added new product');
  })
);

export default productRouter;
