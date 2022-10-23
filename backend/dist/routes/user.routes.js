"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_connection_1 = __importDefault(require("../config/db.connection"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter = (0, express_1.Router)();
const saltround = 10;
/**
 * checking if pararms are valid in the DB
 *
 * @param email
 * @param password
 */
userRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    db_connection_1.default.getConnection((err, conn) => {
        //connetion error with mySql
        if (err) {
            return res.status(400).send(err);
        }
        //checking if email exists in the registered users
        conn.query('SELECT * FROM users WHERE email =?', [req.body.email], (err, getUser) => {
            //Query error with mySql
            if (err) {
                conn.release();
                return res.status(400).json('getting error during connection');
            }
            //if email exists compering passwords
            if (getUser && getUser.length > 0) {
                //compering encrypted password because there is no acssess to the user password
                bcrypt_1.default.compare(req.body.password, getUser[0].password, (error, isMatch) => {
                    if (error) {
                        return res.status(400).json('getting error during connection');
                    }
                    if (isMatch) {
                        //login successfull sending token to be verified when using the website
                        const token = jsonwebtoken_1.default.sign({ user_id: req.body.email }, process.env.SECRET_TOKEN, {
                            expiresIn: "10000s",
                        });
                        return res.status(200).json({
                            id: getUser[0].user_id,
                            firstName: getUser[0].first_name,
                            lastName: getUser[0].last_name,
                            email: getUser[0].email,
                            token: token,
                            phone: getUser[0].phone_number
                        });
                    }
                    //password doesn't match, letting the user try again
                    return res.status(400).json('password does not match!');
                });
                conn.release();
            }
            else {
                conn.release();
                return res.status(400).json('user do not exist!');
            }
        });
    });
}));
userRouter.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // req.session = null;
        return res.status(200).send({
            message: "You've been signed out!"
        });
    }
    catch (err) {
        return res.status(500).send({ err });
    }
}));
/**
 * registering a new user to the database if not yet existed
 *
 * @param first_name
 * @param last_name
 * @param email
 * @param password (saving encrypted in DB)
 * @param phone
 */
userRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    db_connection_1.default.getConnection((err, conn) => {
        //connetion error with mySql
        if (err) {
            return res.status(400).send(err);
        }
        const { user } = req.body;
        //checking if user exists in the DB
        conn.query('SELECT email FROM users WHERE email =?', [user.email], (err, emailInDB) => {
            if (err) {
                conn.release();
                return res.status(400).json('getting error during connection');
            }
            //user already registered 
            if (emailInDB && emailInDB.length > 0) {
                console.log(emailInDB);
                conn.release();
                return res.status(400).json('email exists, try to log in');
            }
            //encrypting password to store in DB for more secure login
            bcrypt_1.default.hash(req.body.user.password, saltround, ((err, newPassword) => {
                if (err) {
                    conn.release();
                    return res.status(400).json('error during password encryption');
                }
                //inseting all the information of the user to the DB
                conn.query('INSERT INTO usersdb.users (first_name, last_name, email, password, phone_number) values (?,?,?,?,?)', [user.firstName, user.lastName, user.email, newPassword, user.phone], (err) => {
                    if (err) {
                        conn.release();
                        return res.status(400).json('getting error during connection');
                    }
                    conn.release();
                    res.status(201).json("registerd successfully");
                });
            }));
        });
    });
}));
exports.default = userRouter;
