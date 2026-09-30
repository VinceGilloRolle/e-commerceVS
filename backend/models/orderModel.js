const pool = require('../config/db');

// Ensure channel column exists on older databases
const ensureChannelColumn = async () => {
  await pool.query(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(20) NOT NULL DEFAULT 'online'`
  );
};

let channelReady = false;
const readyChannel = async () => {
  if (channelReady) return;
  await ensureChannelColumn();
  channelReady = true;
};

// Create a new order with items
const create = async (userId, total, items, channel = 'online') => {
  await readyChannel();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total, channel) VALUES ($1, $2, $3) RETURNING *',
      [userId, total, channel]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// POS sale: price + stock checked from DB inside a transaction
const createPos = async (userId, items) => {
  await readyChannel();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let total = 0;
    const pricedItems = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      const productId = parseInt(item.product_id, 10);

      if (!productId || !quantity || quantity < 1) {
        const err = new Error('Each item needs a valid product_id and quantity.');
        err.status = 400;
        throw err;
      }

      const productResult = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );
      const product = productResult.rows[0];

      if (!product) {
        const err = new Error(`Product #${productId} was not found.`);
        err.status = 404;
        throw err;
      }

      if (Number(product.stock) < quantity) {
        const err = new Error(
          `Not enough stock for ${product.name}. Available: ${product.stock}.`
        );
        err.status = 400;
        throw err;
      }

      const price = Number(product.price);
      total += price * quantity;
      pricedItems.push({
        product_id: product.id,
        quantity,
        price,
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, channel) VALUES ($1, $2, 'pos') RETURNING *`,
      [userId, total]
    );
    const order = orderResult.rows[0];

    for (const item of pricedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      const stockResult = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id',
        [item.quantity, item.product_id]
      );

      if (!stockResult.rows[0]) {
        const err = new Error('Stock changed during checkout. Try again.');
        err.status = 409;
        throw err;
      }
    }

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const attachItems = async (orders) => {
  for (const order of orders) {
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [order.id]
    );
    order.items = itemsResult.rows;
  }
  return orders;
};

const getByUserId = async (userId) => {
  await readyChannel();
  const ordersResult = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return attachItems(ordersResult.rows);
};

const getAll = async () => {
  await readyChannel();
  const ordersResult = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return attachItems(ordersResult.rows);
};

module.exports = {
  create,
  createPos,
  getByUserId,
  getAll,
};
