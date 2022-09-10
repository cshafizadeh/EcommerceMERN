import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAuth } from '../utils.js';

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

userRouter.get(
  '/userEmail/:id',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (user) {
      console.log(user);
      res.send(user.email);
    } else {
      res
        .status(401)
        .send({
          message: 'Error getting order user email (Or user no longer exists).',
        });
    }
  })
);

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isOwner: updatedUser.isOwner,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.put(
  '/removeAdmin/:id',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.user._id);
    console.log('here');
    if (user) {
      if (user.isOwner) {
        res
          .status(401)
          .send({ message: 'Cannot remove permissions for this user' });
      } else {
        if (!user.isAdmin) {
          res.status(401).send('User is already not admin');
        } else {
          user.isAdmin = false;
        }
        const updatedUser = await user.save();
        res.send({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          isOwner: updatedUser.isOwner,
          token: generateToken(updatedUser),
        });
      }
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.put(
  '/addAdmin/:id',
  expressAsyncHandler(async (req, res) => {
    console.log('test');
    console.log(req.body.user);
    const user = await User.findById(req.body.user._id);
    console.log('here');
    if (user) {
      if (user.isOwner) {
        res
          .status(401)
          .send({ message: 'Cannot remove permissions for this user' });
      } else {
        if (user.isAdmin) {
          res.status(401).send('User is already admin');
        } else {
          user.isAdmin = true;
        }
        const updatedUser = await user.save();
        res.send({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          isOwner: updatedUser.isOwner,
          token: generateToken(updatedUser),
        });
      }
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.delete(
  '/delete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req);
    const user = await User.findById(req.user._id);
    if (user) {
      if (user.isAdmin) {
        res.status(401).send('Cannot delete an admin');
      } else {
        await User.deleteOne({ _id: req.user._id });
        res.status(200).send('User successfully deleted');
      }
    } else {
      res.status(401).send('Unable to delete user');
    }
  })
);

userRouter.delete(
  '/admindelete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    console.log(user);
    if (user) {
      if (user.isAdmin || user.isOwner) {
        res.status(401).send('You cannot delete a user who is admin');
      } else {
        await User.deleteOne({ _id: req.params.id });
        res.status(200).send('Product successfully deleted');
      }
    } else {
      res.status(401).send('There was an issue deleting this user');
    }
  })
);

export default userRouter;
