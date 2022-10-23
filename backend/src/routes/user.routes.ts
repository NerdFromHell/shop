import { Router, Request, Response } from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import pool from '../config/db.connection';
import jwt from 'jsonwebtoken';
const userRouter = Router();
const saltround = 10;

/**
 * checking if pararms are valid in the DB
 * 
 * @param email
 * @param password
 */
userRouter.post('/login', async (req: Request, res: Response) => {
    pool.getConnection((err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
        //connetion error with mySql
        if(err) {
            return res.status(400).send(err);
        }

        //checking if email exists in the registered users
        conn.query('SELECT * FROM users WHERE email =?', [req.body.email], (err: any, getUser: any) => {
            //Query error with mySql
            if(err) {
                conn.release();
                return res.status(400).json('getting error during connection');
            } 

            //if email exists compering passwords
            if (getUser  && getUser.length > 0)
            {
                //compering encrypted password because there is no acssess to the user password
                bcrypt.compare(req.body.password, getUser[0].password, (error, isMatch) => {
                    if(error) {
                        return res.status(400).json('getting error during connection');
                    }
                    if (isMatch){
                        //login successfull sending token to be verified when using the website
                        const token = jwt.sign(
                            { user_id: req.body.email },
                            process.env.SECRET_TOKEN,
                            {
                              expiresIn: "10000s",
                            }
                          );                      
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
});

userRouter.post('/logout', async (req: Request, res: Response) => {
    try {
        // req.session = null;
        return res.status(200).send({
          message: "You've been signed out!"
        });
      } catch (err) {
        return res.status(500).send({ err });
      }
})

/**
 * registering a new user to the database if not yet existed
 * 
 * @param first_name
 * @param last_name
 * @param email
 * @param password (saving encrypted in DB)
 * @param phone
 */
userRouter.post('/register', async (req: Request, res: Response) => {
    console.log('hey')
    pool.getConnection((err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
        //connetion error with mySql
        if(err) { return res.status(400).send(err); }

        const { user } = req.body
        //checking if user exists in the DB
        conn.query('SELECT email FROM users WHERE email =?', [user.email], (err: any, emailInDB: any) => {
            if(err) {
                conn.release();
                return res.status(400).json('getting error during connection');
            }
            //user already registered 
            if (emailInDB  && emailInDB.length > 0) {
                console.log(emailInDB)
                conn.release();
                return res.status(400).json('email exists, try to log in');
            }

            //encrypting password to store in DB for more secure login
            bcrypt.hash(req.body.user.password, saltround, ((err, newPassword) => {
                if(err){ 
                    conn.release();
                    return res.status(400).json('error during password encryption');
                }

                //inseting all the information of the user to the DB
                conn.query('INSERT INTO usersdb.users (first_name, last_name, email, password, phone_number) values (?,?,?,?,?)', [user.firstName, user.lastName, user.email, newPassword, user.phone], (err: any) => {
                    if(err){
                        conn.release();
                        return res.status(400).json('getting error during connection');
                    }
                    conn.release();
                    res.status(201).json("registerd successfully");
                });
            }));
        });
    });
});

export default userRouter;