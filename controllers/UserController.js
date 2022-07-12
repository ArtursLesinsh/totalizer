import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import UserModel from '../models/User.js'
import User from '../models/User.js';

export const register =  async (req, res) => {
    try {
     const errors = validationResult(req);
     if(!errors.isEmpty()) {
      return res.status(400).json(errors.array())
     }// здесь идёт проверка формы регистрации на ошибки
  
     const password = req.body.password;
     const salt = await bcrypt.genSalt(10);
     const hash = await bcrypt.hash(password, salt); 
     //здесь идэт шифровка пароля
     //genSalt - алгоритм шифрования пароля
     //

     const doc = new UserModel({
      fullName: req.body.fullName,
      passwordHash: hash,
      role: req.body.role,
     }); //создаём документ пользователя
    
     const user = await doc.save();//документ создан в BD
 
     const token = jwt.sign(
         { 
            _id: user._id,
            role: user.role
        }, 
        'secret123', 
        {
            expiresIn: '30d',
        },
     );
 
     const { passwordHash, ...userData } = user._doc;//вытаскием passwordHash при помощи деструктуризации чтобы не возращать его пользователю
  
     res.json({
         ...userData,
         token,
     });
    } catch (err) {
     console.log(err);
         res.status(500).json({
             message: 'User not successfully created',
         })
    }
 }

 export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ fullName:req.body.fullName })//ищем пользователя

        if (!user) {
            return res.status(404).json({
                message: 'User is not found',
            });
        }//здесь ищем пользователя

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);//сравниваем пароль при логине с тем, сто есть в документе

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Wrong login or password',
            });
        }//сравниваем пароль

        const token = jwt.sign( 
            {
                _id: user._id,
            }, 
                 'secret123',
            {
                expiresIn: '30d',
            },
        );//здесь генерируем (шифруем) token для дальнейших запросов в нашем приложении
        const { passwordHash, ...userData } = user._doc;
 
        res.json({
            ...userData,
            token,
        }) //возращаем токен в ответ клиенту
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Failed to login!',
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);//при помощи findById вытащить Id и найти в базе данных запись по этому Id

        if(!user) {
            return res.status(404).json({
                message: 'User not found',
        });
        }
        const { passwordHash, ...userData } = user._doc;
 
        res.json(userData);
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: 'Access declined',
            })
        }// этот запрос говорит нам, авторизован я или нет, 
}

export const update = async (req, res) => {
    const {role, id} = req.body;
    if (role && id) {
        if (role === "Admin") {
            await User.findById(id).then((user) => {
                if (user.role !== "Admin") {
                    user.role = role;
                    user.save((err) => {
                        if (err) {
                            res.status(400).json({message: "An error occured", error: err.message});
                            process.exit(1);
                        }
                        res.status(201).json({message: "Update successful", user});
                    });
                } else {
                    res.status(400).json({message: "User is already Admin"});
                }
            })
            .catch((error) => {
                res.status(400).json({message: "An error occurred", error: error.message});
            });
        } 
        else {
            res.status(400).json({
                message: "Role is not admin",
            })
        }
    } else {
        res.status(400).json({message: "Role or Id not present"})
    }
}