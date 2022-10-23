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
const db_connection_1 = __importDefault(require("../config/db.connection"));
const token_verify_1 = __importDefault(require("../config/token.verify"));
const redis_1 = require("redis");
const productsRouter = (0, express_1.Router)();
const redisClient = (0, redis_1.createClient)();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();
const EXPERATION_IN = 3600;
//getting products of spesific page
productsRouter.post('/getproducts', token_verify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof (req.body.page) !== 'number') {
        return res.status(400).send('dont mess with data');
    }
    const pageId = req.body.page;
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`products${pageId}`);
    if (products != null) {
        return res.json(JSON.parse(products)); //
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            //checks if user exists in the database
            let startItemId = (pageId * 20) - 19;
            let finishItemId = pageId * 20;
            conn.query(`SELECT * FROM products WHERE product_id BETWEEN ${startItemId} AND ${finishItemId}`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                //converting blob from my sql to base 64
                const dataImagePrefix = `data:image/png;base64,`;
                data.map((item) => {
                    item.image = Buffer.from(item.image);
                    item.image = `${dataImagePrefix}${item.image.toString('base64')}`;
                });
                //saving query data to redis for limited time to not call the DB unnecessarily 
                yield redisClient.setEx(`products${pageId}`, EXPERATION_IN, JSON.stringify(data));
                conn.release();
                return res.status(200).json(data);
            }));
        }));
    }
}));
//getting how many pages will be showns in the front end
productsRouter.get('/getpages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`productspages`);
    if (products != null) {
        return res.json(JSON.parse(products)); //
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            conn.query(`SELECT COUNT(*) FROM usersdb.products;`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                data = JSON.parse(JSON.stringify(data).replace('COUNT(*)', 'count'));
                data[0].count = ((data[0].count - (data[0].count % 20)) / 20) + 1;
                yield redisClient.setEx(`productspages`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            }));
        }));
    }
}));
productsRouter.post('/getsearch/products', token_verify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof (req.body.page) !== 'number') {
        return res.status(400).send('dont mess with data');
    }
    const pageId = req.body.page;
    const searchText = req.body.searchText;
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`product${searchText}${pageId}`);
    if (products != null) {
        console.log('Have it in redis, reporting quickly');
        return res.json(JSON.parse(products)); //
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            //checks if user exists in the database
            let startItemId = (pageId * 20) - 20;
            let stopRow = 20;
            conn.query(`SELECT * FROM products WHERE name LIKE '%${searchText}%' ORDER BY product_id ASC LIMIT ${startItemId},${stopRow}`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                const dataImagePrefix = `data:image/png;base64,`;
                data.map((item) => {
                    item.image = Buffer.from(item.image);
                    item.image = `${dataImagePrefix}${item.image.toString('base64')}`;
                });
                yield redisClient.setEx(`product${searchText}${pageId}`, EXPERATION_IN, JSON.stringify(data));
                console.log('success, sending to front');
                conn.release();
                return res.status(200).json(data);
            }));
        }));
    }
}));
productsRouter.post('/getsearch/products/pages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchText = req.body.searchText;
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`productspages${searchText}`);
    if (products != null) {
        console.log('Have count redis, reporting quickly');
        return res.json(JSON.parse(products)); //
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            conn.query(`SELECT COUNT(*) FROM usersdb.products WHERE name LIKE '%${searchText}%';`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                data = JSON.parse(JSON.stringify(data).replace('COUNT(*)', 'count'));
                data[0].count = ((data[0].count - (data[0].count % 20)) / 20) + 1;
                yield redisClient.setEx(`productspages${searchText}`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            }));
        }));
    }
}));
productsRouter.get('/getallcategories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`productsCategories`);
    if (products != null) {
        return res.json(JSON.parse(products));
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            conn.query(`SELECT DISTINCT(category) FROM usersdb.products;`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                yield redisClient.setEx(`productsCategories`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            }));
        }));
    }
}));
productsRouter.post('/getsearch/products/category/pages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchText = req.body.searchText;
    const category = req.body.category;
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`productspages-${searchText}-${category}`);
    if (products != null) {
        console.log('Have count redis, reporting quickly');
        return res.json(JSON.parse(products)); //
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            conn.query(`SELECT COUNT(*) FROM usersdb.products WHERE name LIKE '%${searchText}%' AND category = '${category}';`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                data = JSON.parse(JSON.stringify(data).replace('COUNT(*)', 'count'));
                data[0].count = ((data[0].count - (data[0].count % 20)) / 20) + 1;
                yield redisClient.setEx(`productspages-${searchText}-${category}`, EXPERATION_IN, JSON.stringify(data));
                return res.status(200).json(data);
            }));
        }));
    }
}));
productsRouter.post('/getcategoryproducts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof (req.body.page) !== 'number') {
        return res.status(400).send('dont mess with data');
    }
    const pageId = req.body.page;
    const searchText = req.body.searchText;
    const category = req.body.category;
    //if the data is in redis no need to call the DB
    const products = yield redisClient.get(`product-${category}-${searchText}-${pageId}`);
    if (products != null) {
        console.log('Have it in redis, reporting quickly');
        return res.json(JSON.parse(products)); //
    }
    else {
        db_connection_1.default.getConnection((err, conn) => __awaiter(void 0, void 0, void 0, function* () {
            //connetion error with mySql
            if (err) {
                return res.status(400).send(err);
            }
            //checks if user exists in the database
            let startItemId = (pageId * 20) - 20;
            let stopRow = 20;
            conn.query(`SELECT * FROM products WHERE name LIKE '%${searchText}%' AND category = '${category}' ORDER BY product_id ASC LIMIT ${startItemId},${stopRow};`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    return res.status(400).json('error has occured');
                }
                const dataImagePrefix = `data:image/png;base64,`;
                data.map((item) => {
                    item.image = Buffer.from(item.image);
                    item.image = `${dataImagePrefix}${item.image.toString('base64')}`;
                });
                yield redisClient.setEx(`product-${category}-${searchText}-${pageId}`, EXPERATION_IN, JSON.stringify(data));
                conn.release();
                return res.status(200).json(data);
            }));
        }));
    }
}));
exports.default = productsRouter;
