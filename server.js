'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Databases ────────────────────────────────────────────────────────────────
const db = {
  products: new Datastore({ filename: path.join(__dirname, 'data/products.db'), autoload: true }),
  customers: new Datastore({ filename: path.join(__dirname, 'data/customers.db'), autoload: true }),
  transactions: new Datastore({ filename: path.join(__dirname, 'data/transactions.db'), autoload: true }),
};

// ── Seed products ────────────────────────────────────────────────────────────
const PRODUCTS = [
  { barcode: '5601234100010', name: 'Azeite Gallo Clássico 750ml', price: 4.99, category: 'Mercearia', brand: 'Gallo', vat: 6, stock: 100 },
  { barcode: '5601234100027', name: 'Bacalhau da Noruega 500g', price: 7.49, category: 'Peixaria', brand: 'Riberalves', vat: 6, stock: 50 },
  { barcode: '5601234100034', name: 'Queijo Serra da Estrela DOP 400g', price: 12.99, category: 'Charcutaria', brand: 'Lactogal', vat: 6, stock: 30 },
  { barcode: '5601234100041', name: 'Vinho Verde Alvarinho 750ml', price: 6.99, category: 'Vinhos', brand: 'Quinta do Crasto', vat: 23, stock: 80 },
  { barcode: '5601234100058', name: 'Pão de Forma Integral Bimbo 650g', price: 2.19, category: 'Padaria', brand: 'Bimbo', vat: 6, stock: 120 },
  { barcode: '5601234100065', name: 'Leite Mimosa Meio-Gordo 1L', price: 0.89, category: 'Lacticínios', brand: 'Mimosa', vat: 6, stock: 200 },
  { barcode: '5601234100072', name: 'Alheira de Mirandela 250g', price: 3.49, category: 'Charcutaria', brand: 'Casa Matias', vat: 6, stock: 60 },
  { barcode: '5601234100089', name: 'Pastel de Nata (pack 6)', price: 3.29, category: 'Padaria', brand: 'Continente', vat: 6, stock: 90 },
  { barcode: '5601234100096', name: 'Arroz Agulha Cigala 1kg', price: 1.49, category: 'Mercearia', brand: 'Cigala', vat: 6, stock: 150 },
  { barcode: '5601234100102', name: 'Cerveja Super Bock 33cl (pack 6)', price: 4.49, category: 'Bebidas', brand: 'Super Bock', vat: 23, stock: 70 },
  { barcode: '5601234100119', name: 'Sardinha em Lata Ramirez 125g', price: 1.79, category: 'Conservas', brand: 'Ramirez', vat: 6, stock: 180 },
  { barcode: '5601234100126', name: 'Chocolate Pantagruel 200g', price: 2.39, category: 'Doçaria', brand: 'Pantagruel', vat: 23, stock: 110 },
  { barcode: '5601234100133', name: 'Maçã Golden Portugal 1kg', price: 1.99, category: 'Fruta', brand: 'Origem Portugal', vat: 6, stock: 200 },
  { barcode: '5601234100140', name: 'Chouriço Regional Alentejano 400g', price: 5.49, category: 'Charcutaria', brand: 'Casa do Porco', vat: 6, stock: 45 },
  { barcode: '5601234100157', name: 'Água das Pedras 1,5L (pack 6)', price: 3.99, category: 'Bebidas', brand: 'Pedras Salgadas', vat: 23, stock: 130 },
];

const LOYALTY_CUSTOMERS = [
  { card: '7640000000001', name: 'Maria Silva', points: 1250, discount: 0.05, active: true },
  { card: '7640000000002', name: 'João Ferreira', points: 340, discount: 0.02, active: true },
  { card: '7640000000003', name: 'Ana Costa', points: 8900, discount: 0.10, active: true },
];

function seedDB() {
  db.products.count({}, (err, count) => {
    if (!count) {
      db.products.insert(PRODUCTS, () => console.log('✔  15 produtos carregados'));
    }
  });
  db.customers.count({}, (err, count) => {
    if (!count) {
      db.customers.insert(LOYALTY_CUSTOMERS, () => console.log('✔  Clientes fidelização carregados'));
    }
  });
}

// ── Products API ─────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  db.products.find({}).sort({ name: 1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

app.get('/api/products/barcode/:barcode', (req, res) => {
  db.products.findOne({ barcode: req.params.barcode }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(doc);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.products.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(doc);
  });
});

// ── Loyalty API ──────────────────────────────────────────────────────────────
app.get('/api/loyalty/:card', (req, res) => {
  db.customers.findOne({ card: req.params.card }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Cartão não encontrado' });
    res.json(doc);
  });
});

app.post('/api/loyalty/:card/points', (req, res) => {
  const { points } = req.body;
  db.customers.update(
    { card: req.params.card },
    { $inc: { points } },
    {},
    (err, n) => {
      if (err) return res.status(500).json({ error: err.message });
      db.customers.findOne({ card: req.params.card }, (e, doc) => res.json(doc));
    }
  );
});

// ── Transactions API ─────────────────────────────────────────────────────────
app.get('/api/transactions', (req, res) => {
  db.transactions.find({}).sort({ createdAt: -1 }).limit(50).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

app.get('/api/transactions/:id', (req, res) => {
  db.transactions.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(doc);
  });
});

app.post('/api/transactions', (req, res) => {
  const { items, loyaltyCard, paymentMethod, total, discount, pointsEarned } = req.body;
  if (!items || !paymentMethod || total == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: items, paymentMethod, total' });
  }

  const validMethods = ['mbway', 'contactless', 'continentepay', 'saldocontinente', 'pix'];
  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Método de pagamento inválido' });
  }

  const tx = {
    id: uuidv4(),
    items,
    loyaltyCard: loyaltyCard || null,
    paymentMethod,
    total,
    discount: discount || 0,
    pointsEarned: pointsEarned || 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.transactions.insert(tx, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });

    // Simulate payment processing (always succeeds in demo)
    setTimeout(() => {
      db.transactions.update({ _id: doc._id }, { $set: { status: 'completed' } }, {}, () => {});
      if (loyaltyCard && pointsEarned) {
        db.customers.update({ card: loyaltyCard }, { $inc: { points: pointsEarned } }, {}, () => {});
      }
    }, 800);

    res.status(201).json({ ...doc, status: 'processing' });
  });
});

app.patch('/api/transactions/:id/cancel', (req, res) => {
  db.transactions.update(
    { _id: req.params.id, status: 'pending' },
    { $set: { status: 'cancelled' } },
    {},
    (err, n) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!n) return res.status(404).json({ error: 'Transação não encontrada ou já processada' });
      res.json({ message: 'Transação cancelada' });
    }
  );
});

// ── Catch-all → SPA ──────────────────────────────────────────────────────────
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Boot ─────────────────────────────────────────────────────────────────────
require('fs').mkdirSync(path.join(__dirname, 'data'), { recursive: true });
seedDB();

app.listen(PORT, () => {
  console.log(`\n🛒  SCO Lite – Continente`);
  console.log(`   Servidor a correr em http://localhost:${PORT}\n`);
});
