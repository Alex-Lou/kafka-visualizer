const { Kafka } = require('kafkajs');
const chalk = require('chalk');

// Kafka configuration
const kafka = new Kafka({
  clientId: 'kafka-visualizer-demo',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();
const admin = kafka.admin();

// Demo configuration
const DEMO_CONFIG = {
  normalFlowInterval: 1500,      // 1.5 seconds between normal messages
  blackFridayInterval: 100,      // 100ms during Black Friday (10 msg/s)
  blackFridayDuration: 90000,    // 1.5 minutes of Black Friday
  errorProbability: 0.05,        // 5% chance of errors
  cancellationProbability: 0.10, // 10% chance of cancellation
};

// Sample data generators
const customerIds = Array.from({ length: 50 }, (_, i) => `CUST-${String(i + 1).padStart(4, '0')}`);
const productIds = ['PROD-001', 'PROD-002', 'PROD-003', 'PROD-004', 'PROD-005', 'PROD-006', 'PROD-007', 'PROD-008', 'PROD-009', 'PROD-010'];
const warehouses = ['WH-PARIS', 'WH-LYON', 'WH-MARSEILLE', 'WH-TOULOUSE'];
const paymentMethods = ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CRYPTO'];
const notificationTypes = ['ORDER_CONFIRMATION', 'PAYMENT_SUCCESS', 'SHIPPING_UPDATE', 'DELIVERY_CONFIRMED'];
const channels = ['EMAIL', 'SMS', 'PUSH'];

let orderCounter = 1000;
let transactionCounter = 5000;
let shipmentCounter = 3000;

// Utility functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Message generators
const generateOrder = (isBlackFriday = false) => {
  const orderId = `ORD-${orderCounter++}`;
  const customerId = randomItem(customerIds);
  const itemCount = isBlackFriday ? randomInt(1, 3) : randomInt(1, 5);

  const items = Array.from({ length: itemCount }, () => ({
    productId: randomItem(productIds),
    quantity: randomInt(1, 3),
    price: randomFloat(10, 500)
  }));

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);

  return {
    orderId,
    customerId,
    items,
    totalAmount: parseFloat(totalAmount),
    currency: 'EUR',
    timestamp: new Date().toISOString(),
    channel: isBlackFriday ? 'WEB' : randomItem(['WEB', 'MOBILE', 'API'])
  };
};

const generateInventoryUpdate = (order) => {
  return order.items.map(item => ({
    productId: item.productId,
    quantity: -item.quantity,
    warehouse: randomItem(warehouses),
    operation: 'DECREMENT',
    reason: 'ORDER_PLACED',
    relatedOrderId: order.orderId,
    timestamp: new Date().toISOString()
  }));
};

const generatePaymentTransaction = (order, hasError = false) => {
  const transactionId = `TXN-${transactionCounter++}`;
  const status = hasError ? 'ERROR' : (Math.random() > 0.95 ? 'PENDING' : 'SUCCESS');

  return {
    transactionId,
    orderId: order.orderId,
    customerId: order.customerId,
    amount: order.totalAmount,
    currency: order.currency,
    method: randomItem(paymentMethods),
    status,
    errorMessage: hasError ? randomItem([
      'Card declined',
      'Insufficient funds',
      'Payment gateway timeout',
      'Invalid card number',
      'Bank authorization failed'
    ]) : undefined,
    processedAt: new Date().toISOString()
  };
};

const generateNotification = (order, type = 'ORDER_CONFIRMATION') => {
  const messages = {
    ORDER_CONFIRMATION: `Your order ${order.orderId} has been confirmed. Total: €${order.totalAmount}`,
    PAYMENT_SUCCESS: `Payment of €${order.totalAmount} processed successfully for order ${order.orderId}`,
    SHIPPING_UPDATE: `Your order ${order.orderId} has been shipped`,
    DELIVERY_CONFIRMED: `Your order ${order.orderId} has been delivered`
  };

  return {
    notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId: order.customerId,
    orderId: order.orderId,
    notificationType: type,
    channel: randomItem(channels),
    message: messages[type],
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };
};

const generateShippingEvent = (order) => {
  const shipmentId = `SHIP-${shipmentCounter++}`;
  const statuses = ['LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const status = randomItem(statuses);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + randomInt(2, 5));

  return {
    shipmentId,
    orderId: order.orderId,
    customerId: order.customerId,
    status,
    location: randomItem(['Paris Hub', 'Lyon Center', 'Marseille Port', 'Toulouse Airport']),
    estimatedDelivery: estimatedDelivery.toISOString(),
    carrier: randomItem(['DHL', 'UPS', 'FedEx', 'La Poste']),
    trackingNumber: `TRK${Date.now()}`,
    timestamp: new Date().toISOString()
  };
};

const generateCompletedOrder = (order) => {
  return {
    orderId: order.orderId,
    customerId: order.customerId,
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
    totalAmount: order.totalAmount,
    processingTime: randomInt(5, 30) + ' seconds'
  };
};

const generateOrderCancellation = (order) => {
  const reasons = [
    'Customer requested cancellation',
    'Payment failed after retries',
    'Item out of stock',
    'Delivery address invalid',
    'Fraudulent activity detected',
    'Customer changed mind',
    'Duplicate order detected'
  ];

  return {
    orderId: order.orderId,
    customerId: order.customerId,
    status: 'CANCELLED',
    reason: randomItem(reasons),
    cancelledAt: new Date().toISOString(),
    refundAmount: order.totalAmount,
    refundStatus: 'PENDING'
  };
};

// Send message to Kafka
const sendMessage = async (topic, messages) => {
  try {
    const records = Array.isArray(messages) ? messages : [messages];
    await producer.send({
      topic,
      messages: records.map(msg => ({
        key: msg.orderId || msg.customerId || msg.productId || String(Date.now()),
        value: JSON.stringify(msg),
        timestamp: Date.now().toString()
      }))
    });
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Error sending to ${topic}:`), error.message);
    return false;
  }
};

// Create topics
const createTopics = async () => {
  console.log(chalk.blue('\n📋 Creating topics...'));

  const topics = [
    { topic: 'orders.created', numPartitions: 3, replicationFactor: 1 },
    { topic: 'orders.completed', numPartitions: 3, replicationFactor: 1 },
    { topic: 'orders.cancelled', numPartitions: 2, replicationFactor: 1 },
    { topic: 'inventory.updates', numPartitions: 4, replicationFactor: 1 },
    { topic: 'customer.notifications', numPartitions: 2, replicationFactor: 1 },
    { topic: 'payment.transactions', numPartitions: 3, replicationFactor: 1 },
    { topic: 'shipping.events', numPartitions: 2, replicationFactor: 1 }
  ];

  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();

    const topicsToCreate = topics.filter(t => !existingTopics.includes(t.topic));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({ topics: topicsToCreate });
      console.log(chalk.green(`✅ Created ${topicsToCreate.length} topics`));
    } else {
      console.log(chalk.yellow('⚠️  All topics already exist'));
    }

    await admin.disconnect();
  } catch (error) {
    console.error(chalk.red('❌ Error creating topics:'), error.message);
    throw error;
  }
};

// Phase 1: Normal activity
const runNormalActivity = async (duration = 120000) => {
  console.log(chalk.blue('\n🔄 Phase 1: Normal Activity (120s / 2 minutes)'));
  const startTime = Date.now();
  let messageCount = 0;
  let ordersCreated = 0;
  let ordersCancelled = 0;
  let ordersCompleted = 0;

  while (Date.now() - startTime < duration) {
    const order = generateOrder(false);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    // Send order created
    if (await sendMessage('orders.created', order)) {
      ordersCreated++;
      console.log(chalk.green(`[${elapsed}s] ✅ Order created: ${order.orderId} (€${order.totalAmount})`));
      messageCount++;

      // Inventory updates
      const inventoryUpdates = generateInventoryUpdate(order);
      for (const update of inventoryUpdates) {
        await sendMessage('inventory.updates', update);
      }
      messageCount += inventoryUpdates.length;

      // Random cancellation (10% chance)
      if (Math.random() < DEMO_CONFIG.cancellationProbability) {
        const cancellation = generateOrderCancellation(order);
        await sendMessage('orders.cancelled', cancellation);
        ordersCancelled++;
        console.log(chalk.yellow(`[${elapsed}s] 🚫 Order cancelled: ${order.orderId} - ${cancellation.reason}`));
        messageCount++;
        await sleep(DEMO_CONFIG.normalFlowInterval);
        continue;
      }

      // Payment transaction
      const hasError = Math.random() < DEMO_CONFIG.errorProbability;
      const payment = generatePaymentTransaction(order, hasError);
      await sendMessage('payment.transactions', payment);
      messageCount++;

      if (hasError) {
        console.log(chalk.red(`[${elapsed}s] ❌ Payment failed: ${payment.transactionId} - ${payment.errorMessage}`));
      }

      // Notification
      if (payment.status === 'SUCCESS') {
        const notification = generateNotification(order, 'ORDER_CONFIRMATION');
        await sendMessage('customer.notifications', notification);
        messageCount++;

        // Shipping event
        if (Math.random() > 0.3) {
          const shipping = generateShippingEvent(order);
          await sendMessage('shipping.events', shipping);
          console.log(chalk.cyan(`[${elapsed}s] 🚚 Shipping: ${shipping.shipmentId} - ${shipping.status}`));
          messageCount++;
        }

        // Complete order
        if (Math.random() > 0.5) {
          const completed = generateCompletedOrder(order);
          await sendMessage('orders.completed', completed);
          ordersCompleted++;
          console.log(chalk.green(`[${elapsed}s] ✔️  Order completed: ${order.orderId}`));
          messageCount++;
        }
      }
    }

    await sleep(DEMO_CONFIG.normalFlowInterval);
  }

  console.log(chalk.cyan(`\n📊 Phase 1 complete: ${messageCount} messages | ${ordersCreated} created | ${ordersCancelled} cancelled | ${ordersCompleted} completed\n`));
  return messageCount;
};

// Phase 2: Black Friday (high load)
const runBlackFriday = async (duration = 90000) => {
  console.log(chalk.blue('\n🔥 Phase 2: Black Friday Simulation (90s / 1.5 minutes)'));
  console.log(chalk.yellow('⚡ High load: ~10 orders/second\n'));

  const startTime = Date.now();
  let messageCount = 0;
  let orderCount = 0;
  let cancelCount = 0;
  let lastLog = Date.now();

  while (Date.now() - startTime < duration) {
    const order = generateOrder(true);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (await sendMessage('orders.created', order)) {
      orderCount++;
      messageCount++;

      // Some orders get cancelled due to high load (5% chance)
      if (Math.random() < 0.05) {
        const cancellation = generateOrderCancellation(order);
        cancellation.reason = 'System overload - payment timeout';
        await sendMessage('orders.cancelled', cancellation);
        cancelCount++;
        messageCount++;
      } else {
        // Fast-track processing during Black Friday
        const payment = generatePaymentTransaction(order);
        await sendMessage('payment.transactions', payment);
        messageCount++;

        if (payment.status === 'SUCCESS') {
          const notification = generateNotification(order);
          await sendMessage('customer.notifications', notification);
          messageCount++;
        }
      }

      // Log every 10 seconds
      if (Date.now() - lastLog >= 10000) {
        console.log(chalk.magenta(`[${elapsed}s] 🔥 Black Friday: ${orderCount} orders, ${cancelCount} cancelled, ${messageCount} messages`));
        lastLog = Date.now();
      }
    }

    await sleep(DEMO_CONFIG.blackFridayInterval);
  }

  console.log(chalk.cyan(`\n📊 Phase 2 complete: ${messageCount} messages | ${orderCount} orders | ${cancelCount} cancelled\n`));
  return messageCount;
};

// Phase 3: Incidents
const runIncidents = async () => {
  console.log(chalk.blue('\n⚠️  Phase 3: Incident Simulation (30s)\n'));

  const startTime = Date.now();
  let messageCount = 0;

  // Payment errors spike
  console.log(chalk.red('💳 Simulating payment gateway issues...'));
  for (let i = 0; i < 8; i++) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const order = generateOrder();
    await sendMessage('orders.created', order);
    const payment = generatePaymentTransaction(order, true);
    await sendMessage('payment.transactions', payment);
    console.log(chalk.red(`[${elapsed}s] ❌ Payment error: ${order.orderId} - ${payment.errorMessage}`));
    messageCount += 2;
    await sleep(1000);
  }

  // Stock shortage
  console.log(chalk.yellow('\n📦 Simulating stock shortage...'));
  for (let i = 0; i < 5; i++) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const product = randomItem(productIds);
    const stockAlert = {
      productId: product,
      quantity: 0,
      warehouse: randomItem(warehouses),
      operation: 'ALERT',
      reason: 'OUT_OF_STOCK',
      severity: 'HIGH',
      timestamp: new Date().toISOString()
    };
    await sendMessage('inventory.updates', stockAlert);
    console.log(chalk.yellow(`[${elapsed}s] ⚠️  Stock alert: ${product} - OUT OF STOCK`));
    messageCount++;
    await sleep(1500);
  }

  // Shipping delays
  console.log(chalk.magenta('\n🚚 Simulating shipping delays...'));
  for (let i = 0; i < 5; i++) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const order = generateOrder();
    const delayReason = randomItem(['Weather conditions', 'High volume', 'Carrier issue', 'Address problem']);
    const delayedShipping = {
      ...generateShippingEvent(order),
      status: 'DELAYED',
      delayReason: delayReason,
      expectedDelay: `${randomInt(1, 3)} days`
    };
    await sendMessage('shipping.events', delayedShipping);
    console.log(chalk.magenta(`[${elapsed}s] 🚚 Shipping delayed: ${order.orderId} - ${delayReason}`));
    messageCount++;
    await sleep(1000);
  }

  console.log(chalk.cyan(`\n📊 Phase 3 complete: ${messageCount} messages sent\n`));
  return messageCount;
};

// Phase 4: Resolution and normal flow
const runResolution = async (duration = 60000) => {
  console.log(chalk.blue('\n✅ Phase 4: Resolution & Recovery (60s / 1 minute)\n'));

  const startTime = Date.now();
  let messageCount = 0;
  let ordersProcessed = 0;

  while (Date.now() - startTime < duration) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const order = generateOrder();

    if (await sendMessage('orders.created', order)) {
      const payment = generatePaymentTransaction(order, false);
      await sendMessage('payment.transactions', payment);

      const notification = generateNotification(order, 'PAYMENT_SUCCESS');
      await sendMessage('customer.notifications', notification);

      const shipping = generateShippingEvent(order);
      await sendMessage('shipping.events', shipping);

      const completed = generateCompletedOrder(order);
      await sendMessage('orders.completed', completed);

      ordersProcessed++;
      messageCount += 5;
      console.log(chalk.green(`[${elapsed}s] ✅ Order ${order.orderId} fully processed (€${order.totalAmount})`));
    }

    await sleep(3000);
  }

  console.log(chalk.cyan(`\n📊 Phase 4 complete: ${messageCount} messages | ${ordersProcessed} orders fully processed\n`));
  return messageCount;
};

// Main demo runner
const runDemo = async () => {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║   Kafka Visualizer - E-Commerce Demo      ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════╝\n'));

  try {
    // Connect
    console.log(chalk.blue('🔌 Connecting to Kafka...'));
    await producer.connect();
    console.log(chalk.green('✅ Connected to Kafka\n'));

    // Create topics
    await createTopics();

    // Wait for topics to be ready
    await sleep(3000);

    const demoStartTime = Date.now();

    // Run demo phases (Total: 5 minutes / 300 seconds)
    const phase1Messages = await runNormalActivity(120000);  // 120s = 2 minutes
    const phase2Messages = await runBlackFriday(90000);      // 90s = 1.5 minutes
    const phase3Messages = await runIncidents();              // ~30s
    const phase4Messages = await runResolution(60000);        // 60s = 1 minute

    const totalMessages = phase1Messages + phase2Messages + phase3Messages + phase4Messages;
    const totalDuration = Math.floor((Date.now() - demoStartTime) / 1000);

    // Final summary
    console.log(chalk.bold.green('\n╔═══════════════════════════════════════════════════╗'));
    console.log(chalk.bold.green('║          Demo Complete! 🎉                        ║'));
    console.log(chalk.bold.green('╚═══════════════════════════════════════════════════╝\n'));
    console.log(chalk.cyan(`📊 Total messages sent: ${totalMessages}`));
    console.log(chalk.cyan(`⏱️  Total duration: ${Math.floor(totalDuration / 60)}m ${totalDuration % 60}s`));
    console.log(chalk.cyan(`🎯 Topics used: 7 (orders.created, orders.completed, orders.cancelled, inventory.updates, payment.transactions, shipping.events, customer.notifications)`));
    console.log(chalk.cyan(`📦 Orders processed: ${orderCounter - 1000}`));
    console.log(chalk.cyan(`💳 Transactions: ${transactionCounter - 5000}`));
    console.log(chalk.cyan(`🚚 Shipments: ${shipmentCounter - 3000}\n`));

  } catch (error) {
    console.error(chalk.red('\n❌ Demo failed:'), error);
  } finally {
    await producer.disconnect();
    console.log(chalk.blue('\n🔌 Disconnected from Kafka'));
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⚠️  Shutting down gracefully...'));
  await producer.disconnect();
  process.exit(0);
});

// Run the demo
runDemo().catch(console.error);
