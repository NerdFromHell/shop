import { Router, Request, Response, NextFunction } from 'express';
import mysql from 'mysql2';
import pool from '../config/db.connection';
import verifyToken from '../config/token.verify';
import { createClient } from 'redis';

const productsRouter = Router();
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();
const EXPERATION_IN = 3600;

//getting products of spesific page
productsRouter.post('/getproducts', verifyToken, async (req: Request, res: Response) => {
    if(typeof(req.body.page) !==  'number'){ return res.status(400).send('dont mess with data'); }
    const pageId: number = req.body.page

    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`products${pageId}`);
    if(products != null) {
        return res.json(JSON.parse(products));//
    } 
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            //checks if user exists in the database
            let startItemId: number = (pageId * 20) - 19;
            let finishItemId: number = pageId*20;
            conn.query(`SELECT * FROM products WHERE product_id BETWEEN ${startItemId} AND ${finishItemId}`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }

                //converting blob from my sql to base 64
                const dataImagePrefix = `data:image/png;base64,`;
                data.map((item: any)=> {
                    item.image =  Buffer.from(item.image);
                    item.image = `${dataImagePrefix}${item.image.toString('base64')}`
                });

                //saving query data to redis for limited time to not call the DB unnecessarily 
                await redisClient.setEx(`products${pageId}`, EXPERATION_IN, JSON.stringify(data));
                conn.release();
                return res.status(200).json(data);
            });
        });
    }
}); 

//getting how many pages will be showns in the front end
productsRouter.get('/getpages', async (req: Request, res: Response) => {
    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`productspages`);
    if(products != null) {
        return res.json(JSON.parse(products));//
    }
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            conn.query(`SELECT COUNT(*) FROM usersdb.products;`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }
                data = JSON.parse(JSON.stringify(data).replace('COUNT(*)','count'))
                data[0].count = ((data[0].count  - (data[0].count % 20)) / 20) + 1;

                await redisClient.setEx(`productspages`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            });
        });
    } 
});

productsRouter.post('/getsearch/products', verifyToken, async (req: Request, res: Response) => {
    if(typeof(req.body.page) !==  'number'){ return res.status(400).send('dont mess with data'); }
    const pageId: number = req.body.page
    const searchText: string = req.body.searchText;

    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`product${searchText}${pageId}`);
    if(products != null) {
        console.log('Have it in redis, reporting quickly');
        return res.json(JSON.parse(products));//
    } 
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            //checks if user exists in the database
            let startItemId: number = (pageId * 20) - 20;
            let stopRow: number = 20;
            conn.query(`SELECT * FROM products WHERE name LIKE '%${searchText}%' ORDER BY product_id ASC LIMIT ${startItemId},${stopRow}`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }

                const dataImagePrefix = `data:image/png;base64,`;
                data.map((item: any)=> {
                    item.image =  Buffer.from(item.image);
                    item.image = `${dataImagePrefix}${item.image.toString('base64')}`
                });

                await redisClient.setEx(`product${searchText}${pageId}`, EXPERATION_IN, JSON.stringify(data));
                console.log('success, sending to front');
                conn.release();
                return res.status(200).json(data);
            });
        });
    }
}); 

productsRouter.post('/getsearch/products/pages', async (req: Request, res: Response) => {
    const searchText: string = req.body.searchText;

    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`productspages${searchText}`);
    if(products != null) {
        console.log('Have count redis, reporting quickly');
        return res.json(JSON.parse(products));//
    }
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            conn.query(`SELECT COUNT(*) FROM usersdb.products WHERE name LIKE '%${searchText}%';`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }
                data = JSON.parse(JSON.stringify(data).replace('COUNT(*)','count'))
                data[0].count = ((data[0].count  - (data[0].count % 20)) / 20) + 1;

                await redisClient.setEx(`productspages${searchText}`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            });
        });
    } 
});

productsRouter.get('/getallcategories', async (req: Request, res: Response) => {
    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`productsCategories`);
    if(products != null) {
        return res.json(JSON.parse(products));
    }
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            conn.query(`SELECT DISTINCT(category) FROM usersdb.products;`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }

                await redisClient.setEx(`productsCategories`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            });
        });
    } 
});

productsRouter.post('/getsearch/products/category/pages', async (req: Request, res: Response) => {
    const searchText: string = req.body.searchText;
    const category: string = req.body.category;

    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`productspages-${searchText}-${category}`);

    if(products != null) {
        console.log('Have count redis, reporting quickly');
        return res.json(JSON.parse(products));//
    }
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            conn.query(`SELECT COUNT(*) FROM usersdb.products WHERE name LIKE '%${searchText}%' AND category = '${category}';`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }
                data = JSON.parse(JSON.stringify(data).replace('COUNT(*)','count'))
                data[0].count = ((data[0].count  - (data[0].count % 20)) / 20) + 1;

                await redisClient.setEx(`productspages-${searchText}-${category}`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            });
        });
    } 
});

productsRouter.post('/getcategoryproducts', async (req: Request, res: Response) => {
    if(typeof(req.body.page) !==  'number') { return res.status(400).send('dont mess with data'); }
    const pageId: number = req.body.page
    const searchText: string = req.body.searchText;
    const category: string = req.body.category;

    //if the data is in redis no need to call the DB
    const products = await redisClient.get(`product-${category}-${searchText}-${pageId}`);
    if(products != null) {
        console.log('Have it in redis, reporting quickly');
        return res.json(JSON.parse(products));//
    } 
    else{
        pool.getConnection(async (err: NodeJS.ErrnoException, conn: mysql.PoolConnection) => {
            //connetion error with mySql
            if(err) { return res.status(400).send(err); }

            //checks if user exists in the database
            let startItemId: number = (pageId * 20) - 20;
            let stopRow: number = 20;
            conn.query(`SELECT * FROM products WHERE name LIKE '%${searchText}%' AND category = '${category}' ORDER BY product_id ASC LIMIT ${startItemId},${stopRow};`, async (err: any, data: any) => {
                if(err) {
                    conn.release();             
                    return res.status(400).json('error has occured');
                }

                const dataImagePrefix = `data:image/png;base64,`;
                data.map((item: any)=> {
                    item.image =  Buffer.from(item.image);
                    item.image = `${dataImagePrefix}${item.image.toString('base64')}`
                });

                await redisClient.setEx(`product-${category}-${searchText}-${pageId}`, EXPERATION_IN, JSON.stringify(data));
                conn.release();
                return res.status(200).json(data);
            });
        });
    }
});

export default productsRouter;