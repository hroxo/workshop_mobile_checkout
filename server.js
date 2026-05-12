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
  products:     new Datastore({ filename: path.join(__dirname, 'data/products.db'),     autoload: true }),
  customers:    new Datastore({ filename: path.join(__dirname, 'data/customers.db'),    autoload: true }),
  transactions: new Datastore({ filename: path.join(__dirname, 'data/transactions.db'), autoload: true }),
  picklists:    new Datastore({ filename: path.join(__dirname, 'data/picklists.db'),    autoload: true }),
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

const PICKLISTS_SEED = [
  {
    orderId: 'ORD-2024-001', type: 'delivery', customer: 'Entrega #4521',
    status: 'pending', createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    items: [
      { id: uuidv4(), name: 'Leite Mimosa Meio-Gordo 1L',      qty: 3, location: 'Corredor A · Prateleira 2', picked: false },
      { id: uuidv4(), name: 'Arroz Agulha Cigala 1kg',          qty: 2, location: 'Corredor B · Prateleira 1', picked: false },
      { id: uuidv4(), name: 'Azeite Gallo Clássico 750ml',      qty: 1, location: 'Corredor B · Prateleira 3', picked: false },
      { id: uuidv4(), name: 'Maçã Golden Portugal 1kg',          qty: 2, location: 'Frescos · Corredor F',      picked: false },
    ],
  },
  {
    orderId: 'ORD-2024-002', type: 'click_collect', customer: 'Click & Collect #892',
    status: 'in_progress', createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    items: [
      { id: uuidv4(), name: 'Queijo Serra da Estrela DOP 400g', qty: 1, location: 'Charcutaria · Balcão 1',    picked: true  },
      { id: uuidv4(), name: 'Alheira de Mirandela 250g',         qty: 2, location: 'Charcutaria · Balcão 1',    picked: false },
      { id: uuidv4(), name: 'Vinho Verde Alvarinho 750ml',       qty: 3, location: 'Corredor C · Prateleira 2', picked: false },
      { id: uuidv4(), name: 'Pastel de Nata (pack 6)',           qty: 2, location: 'Padaria · Balcão 2',        picked: false },
    ],
  },
  {
    orderId: 'ORD-2024-003', type: 'delivery', customer: 'Entrega #4519',
    status: 'completed', createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    items: [
      { id: uuidv4(), name: 'Cerveja Super Bock 33cl (pack 6)', qty: 2, location: 'Corredor D · Prateleira 4', picked: true },
      { id: uuidv4(), name: 'Água das Pedras 1,5L (pack 6)',    qty: 1, location: 'Corredor D · Prateleira 1', picked: true },
      { id: uuidv4(), name: 'Sardinha em Lata Ramirez 125g',    qty: 4, location: 'Corredor E · Prateleira 2', picked: true },
    ],
  },
];

function seedDB() {
  db.products.count({}, (err, count) => {
    if (!count) db.products.insert(PRODUCTS, () => console.log('✔  15 produtos carregados'));
  });
  db.customers.count({}, (err, count) => {
    if (!count) db.customers.insert(LOYALTY_CUSTOMERS, () => console.log('✔  Clientes fidelização carregados'));
  });
  db.picklists.count({}, (err, count) => {
    if (!count) db.picklists.insert(PICKLISTS_SEED, () => console.log('✔  Picklists de demonstração carregadas'));
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

// ── Picklists API ────────────────────────────────────────────────────────────
app.get('/api/picklists', (req, res) => {
  db.picklists.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

app.get('/api/picklists/:id', (req, res) => {
  db.picklists.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Picklist não encontrada' });
    res.json(doc);
  });
});

app.post('/api/picklists', (req, res) => {
  const { orderId, type, customer, items } = req.body;
  if (!orderId || !items?.length) return res.status(400).json({ error: 'orderId e items são obrigatórios' });
  const doc = {
    orderId, type: type || 'delivery', customer: customer || orderId,
    status: 'pending', createdAt: new Date().toISOString(),
    items: items.map(i => ({ ...i, id: uuidv4(), picked: false })),
  };
  db.picklists.insert(doc, (err, created) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(created);
  });
});

// Toggle a single item picked/unpicked
app.patch('/api/picklists/:id/items/:itemId', (req, res) => {
  db.picklists.findOne({ _id: req.params.id }, (err, doc) => {
    if (err || !doc) return res.status(404).json({ error: 'Não encontrado' });
    const items = doc.items.map(i =>
      i.id === req.params.itemId ? { ...i, picked: !i.picked } : i
    );
    const allPicked = items.every(i => i.picked);
    const status = allPicked ? 'completed' : 'in_progress';
    db.picklists.update({ _id: req.params.id }, { $set: { items, status } }, {}, (e) => {
      if (e) return res.status(500).json({ error: e.message });
      db.picklists.findOne({ _id: req.params.id }, (e2, updated) => res.json(updated));
    });
  });
});

// Force-complete a picklist
app.patch('/api/picklists/:id/complete', (req, res) => {
  const items_update = {};
  db.picklists.findOne({ _id: req.params.id }, (err, doc) => {
    if (err || !doc) return res.status(404).json({ error: 'Não encontrado' });
    const items = doc.items.map(i => ({ ...i, picked: true }));
    db.picklists.update({ _id: req.params.id }, { $set: { items, status: 'completed' } }, {}, (e) => {
      if (e) return res.status(500).json({ error: e.message });
      db.picklists.findOne({ _id: req.params.id }, (e2, updated) => res.json(updated));
    });
  });
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
