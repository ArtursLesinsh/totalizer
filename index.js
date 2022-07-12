import express from 'express';
import mongoose from 'mongoose';
import { registerValidation } from './validations/auth.js';
import checkAuth from './middleware/checkAuth.js';
import * as UserController from './controllers/UserController.js';

mongoose
.connect('mongodb+srv://root:root@cluster0.xf3ds.mongodb.net/blog?retryWrites=true&w=majority')
.then(() => console.log('DB is fucking ok'))
.catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());

app.post('/auth/register', registerValidation, UserController.register);
app.post('/auth/login', UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);
app.put('/auth/update', UserController.update);

app.listen(5000, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server is fucking OK')
})