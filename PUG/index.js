const express = require('express');
const products = require('./apiProductos');

const app = express();
const routerProductos = express.Router();

app.set('views','./views');
app.set('view engine', 'pug');

app.use('/api/productos', routerProductos);
routerProductos.use(express.json());
routerProductos.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const apiProducts = new products.Products();

//#region Middlewares
function validateProduct(req, res, next) {
  let product = req.body;
  apiProducts.validateProduct(product) == true
    ? next()
    : res.status(400).render("partials/product",{ error: 'Invalid Body' });
}

function existProduct(req, res, next) {
  let id = req.params.id;
  apiProducts.existsProduct(id) == true
    ? next()
    : res.status(400).render("partials/product",{ error: `Product ${id} not found` });
}

//#endregion

//#region  RUTAS
routerProductos.get('/', (req, res) => {
  let products = apiProducts.getAll();
  res.render("index", {products});
});

routerProductos.get('/:id', existProduct, (req, res) => {
  let id = req.params.id;
  let product = apiProducts.getById(id);
  res.render('product', {product});
});

routerProductos.post('/', validateProduct, (req, res) => {
  let product = req.body;
  apiProducts.saveProduct(product);
  res.redirect('/api/productos/')
});

routerProductos.put('/:id', validateProduct, existProduct, (req, res) => {
  let product = apiProducts.updateProduct(req.body, req.params.id);
  res.render('product', {product});
});

routerProductos.delete('/:id', existProduct, (req, res) => {
  let id = req.params.id;
  apiProducts.deleteById(id);
  res.render("delete",{message: `Product ${id} deleted successfully`});
});

//#endregion

//#region Server Listen
const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`Servidor http escuchando en el puerto ${server.address().port}`);
});
server.on('error', (error) => console.log(`Error en servidor ${error}`));
//#endregion
