import express from 'express';
import routes from './routes';
import cors from 'cors';
import cookieSession from 'cookie-session';
import userRouter from './routes/user.routes';
import productsRouter from './routes/products.routes';

const app = express();
var corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(
    cookieSession({
      name: "shop-session",
      secret: "COOKIE_SECRET", // should use as secret environment variable
      httpOnly: true,
      sameSite: 'strict'
    })
);

app.use('/user', userRouter);

app.use('/products', productsRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening port number #${process.env.PORT}`)
});
