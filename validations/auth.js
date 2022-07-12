import { body } from 'express-validator';

export const registerValidation = [
    body('fullName', 'Enter a name').isLength({min: 4}),
    body('password', 'Password should be at lest 5 characters long').isLength({min: 5}),
]