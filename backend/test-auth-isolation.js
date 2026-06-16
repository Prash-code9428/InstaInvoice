/**
 * Integration Test Script: Authentication & Data Isolation Verification
 * This script starts a test server on port 5055, connects to a test database,
 * and executes a suite of tests to verify:
 * 1. User registration, login, and JWT generation.
 * 2. Route protection using authMiddleware.
 * 3. Enterprise Profile isolation (and unique userId per profile constraint).
 * 4. Product catalog isolation (including compound uniqueness index on { userId, productId }).
 * 5. Invoice isolation and profile snapshotting (including compound uniqueness index on { userId, invoiceNumber }).
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment configurations
dotenv.config();

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Import Models
const User = require('./models/User');
const EnterpriseProfile = require('./models/profileModel');
const Product = require('./models/productModel');
const Invoice = require('./models/invoiceModel');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

let server;
let mongoServer;

// Helper to make fetch requests
async function makeRequest(path, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = {
    method,
    headers,
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, config);
  const data = await response.json();
  return { status: response.status, data };
}

// Main test runner
async function runTests() {
  console.log('--- STARTING INTEGRATION TESTS ---');

  try {
    // 1. Establish database connection (using MongoMemoryServer if available, fallback to local test DB)
    let mongoUri = 'mongodb://localhost:27017/instainvoice_test';
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('Starting MongoMemoryServer for isolated testing...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`MongoMemoryServer spawned at: ${mongoUri}`);
    } catch (e) {
      console.log('Note: mongodb-memory-server not loaded. Falling back to default URI.');
    }

    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Force index synchronization before executing writes
    console.log('Syncing database indexes...');
    await Promise.all([
      User.syncIndexes(),
      EnterpriseProfile.syncIndexes(),
      Product.syncIndexes(),
      Invoice.syncIndexes()
    ]);
    console.log('Database indexes synced.');

    // Clear test database collections to start fresh
    console.log('Clearing test database collections...');
    await User.deleteMany({});
    await EnterpriseProfile.deleteMany({});
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    console.log('Database cleared.');

    // 2. Setup and start express application
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/analytics', analyticsRoutes);

    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}`);
    });

    // --- TEST SUITE ---
    let tokenA, tokenB;
    let userAId, userBId;

    // --- TEST 1: Register User A ---
    console.log('\n[Test 1] Registering User A...');
    const regA = await makeRequest('/api/auth/register', 'POST', {
      name: 'Alice Cooper',
      email: 'alice@example.com',
      password: 'password123'
    });
    
    if (regA.status !== 201 || !regA.data.token) {
      throw new Error(`User A registration failed: ${JSON.stringify(regA.data)}`);
    }
    tokenA = regA.data.token;
    userAId = regA.data.user.id;
    console.log('✓ User A registered successfully.');

    // --- TEST 2: Register User B ---
    console.log('\n[Test 2] Registering User B...');
    const regB = await makeRequest('/api/auth/register', 'POST', {
      name: 'Bob Marley',
      email: 'bob@example.com',
      password: 'password123'
    });
    
    if (regB.status !== 201 || !regB.data.token) {
      throw new Error(`User B registration failed: ${JSON.stringify(regB.data)}`);
    }
    tokenB = regB.data.token;
    userBId = regB.data.user.id;
    console.log('✓ User B registered successfully.');

    // --- TEST 3: Register User with duplicate email ---
    console.log('\n[Test 3] Registering User with duplicate email (should fail)...');
    const regDup = await makeRequest('/api/auth/register', 'POST', {
      name: 'Alice Duplicate',
      email: 'alice@example.com',
      password: 'password123'
    });
    if (regDup.status !== 400) {
      throw new Error(`Expected 400 Bad Request for duplicate email, got ${regDup.status}`);
    }
    console.log('✓ Duplicate registration rejected correctly.');

    // --- TEST 4: Login User A ---
    console.log('\n[Test 4] Logging in User A...');
    const loginA = await makeRequest('/api/auth/login', 'POST', {
      email: 'alice@example.com',
      password: 'password123'
    });
    if (loginA.status !== 200 || !loginA.data.token) {
      throw new Error(`User A login failed: ${JSON.stringify(loginA.data)}`);
    }
    console.log('✓ User A login successful.');

    // --- TEST 5: Verify Auth Middleware Protection ---
    console.log('\n[Test 5] Accessing protected route without token...');
    const noToken = await makeRequest('/api/profile', 'GET');
    if (noToken.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for route without token, got ${noToken.status}`);
    }
    console.log('✓ Protected route correctly blocked anonymous access.');

    // --- TEST 6: Enterprise Profile Isolation & Configuration ---
    console.log('\n[Test 6] Setting Enterprise Profile for User A...');
    // Alice is a Regular Taxpayer (requires 15-digit GSTIN)
    const profileAData = {
      name: 'Alice Analytics Ltd',
      address: '123 Tech Park, Bangalore, India',
      contactNumber: '+91 98765 43210',
      registrationType: 'Regular Taxpayer',
      gstin: '29AAAAA1111A1Z1', // Valid Indian GSTIN format
      logoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      bankName: 'Alice Analytics Bank',
      branchName: 'Tech Park Branch',
      accountNumber: '111122223333',
      ifscCode: 'ALIC0001234',
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      upiId: 'alice@okaxis',
      preferredPaymentMethod: 'UPI'
    };
    
    const setProfileA = await makeRequest('/api/profile', 'POST', profileAData, tokenA);
    if (setProfileA.status !== 201) {
      throw new Error(`Failed to create profile for User A: ${JSON.stringify(setProfileA.data)}`);
    }
    console.log('✓ User A profile created.');

    console.log('Fetching User A profile...');
    const getProfileA = await makeRequest('/api/profile', 'GET', null, tokenA);
    if (getProfileA.status !== 200 || getProfileA.data.name !== 'Alice Analytics Ltd') {
      throw new Error(`Profile A retrieval failed or mismatched: ${JSON.stringify(getProfileA.data)}`);
    }
    if (getProfileA.data.bankName !== 'Alice Analytics Bank' || getProfileA.data.signatureUrl !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA') {
      throw new Error(`Profile A bank/signature details mismatched: ${JSON.stringify(getProfileA.data)}`);
    }
    if (getProfileA.data.branchName !== 'Tech Park Branch' || getProfileA.data.upiId !== 'alice@okaxis' || getProfileA.data.preferredPaymentMethod !== 'UPI') {
      throw new Error(`Profile A expanded details mismatched: ${JSON.stringify(getProfileA.data)}`);
    }
    console.log('✓ User A profile matches.');

    console.log('Fetching profile for User B (who has no profile configured yet)...');
    const getProfileBEmpty = await makeRequest('/api/profile', 'GET', null, tokenB);
    if (getProfileBEmpty.status !== 200 || getProfileBEmpty.data !== null) {
      throw new Error(`Expected null profile for User B, got ${JSON.stringify(getProfileBEmpty.data)}`);
    }
    console.log('✓ User B profile is empty (correct isolation).');

    console.log('Setting Enterprise Profile for User B...');
    // Bob is a Composition Scheme business
    const profileBData = {
      name: 'Bob Bakery',
      address: '456 Sweet Street, Mumbai, India',
      contactNumber: '+91 99999 88888',
      registrationType: 'Composition Scheme',
      gstin: '27BBBBB2222B2Z2',
      logoUrl: '',
      bankName: 'Bob Bakery Bank',
      branchName: 'Sweet Street Branch',
      accountNumber: '999988887777',
      ifscCode: 'BOBB0005678',
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      upiId: 'bob@okicici',
      preferredPaymentMethod: 'BANK'
    };
    const setProfileB = await makeRequest('/api/profile', 'POST', profileBData, tokenB);
    if (setProfileB.status !== 201) {
      throw new Error(`Failed to create profile for User B: ${JSON.stringify(setProfileB.data)}`);
    }
    console.log('✓ User B profile created.');

    console.log('Verifying User A profile was not modified by User B profile creation...');
    const getProfileACheck = await makeRequest('/api/profile', 'GET', null, tokenA);
    if (getProfileACheck.data.name !== 'Alice Analytics Ltd' || getProfileACheck.data.bankName !== 'Alice Analytics Bank') {
      throw new Error(`User A profile was corrupted or modified: ${JSON.stringify(getProfileACheck.data)}`);
    }
    console.log('✓ User A profile remains isolated.');

    // --- TEST 7: Product Catalog Isolation & Compound Index ---
    console.log('\n[Test 7] Creating products for User A and User B with matching productId/SKU...');
    // P1 for Alice
    const productA = {
      name: 'Super Apple Service',
      productId: 'SKU-999',
      basePrice: 500,
      hsnSacCode: 'SAC888',
      gstRate: 18
    };
    // P2 for Bob (same productId 'SKU-999')
    const productB = {
      name: 'Deluxe Cake Slice',
      productId: 'SKU-999', // Matches Alice's product ID to verify compound uniqueness
      basePrice: 150,
      hsnSacCode: 'HSN555',
      gstRate: 5
    };

    const addProdA = await makeRequest('/api/products', 'POST', productA, tokenA);
    if (addProdA.status !== 201) {
      throw new Error(`Failed to add product for User A: ${JSON.stringify(addProdA.data)}`);
    }
    const prodAId = addProdA.data._id;
    console.log('✓ Product for User A created successfully.');

    const addProdB = await makeRequest('/api/products', 'POST', productB, tokenB);
    if (addProdB.status !== 201) {
      throw new Error(`Failed to add product for User B (compound index failed?): ${JSON.stringify(addProdB.data)}`);
    }
    const prodBId = addProdB.data._id;
    console.log('✓ Product for User B created successfully (allowing matching SKU/productId per user!).');

    console.log('Attempting to create another product for User A with duplicate SKU-999 (should fail)...');
    const addProdADup = await makeRequest('/api/products', 'POST', {
      name: 'Duplicate Apple Service',
      productId: 'SKU-999',
      basePrice: 600,
      hsnSacCode: 'SAC888',
      gstRate: 18
    }, tokenA);
    if (addProdADup.status !== 400) {
      throw new Error(`Expected 400 duplicate key error for User A duplicate product, got ${addProdADup.status}`);
    }
    console.log('✓ Duplicate product ID rejected correctly for the same user.');

    console.log('Fetching products for User A...');
    const getProdsA = await makeRequest('/api/products', 'GET', null, tokenA);
    if (getProdsA.data.length !== 1 || getProdsA.data[0].name !== 'Super Apple Service') {
      throw new Error(`User A product query returned incorrect elements: ${JSON.stringify(getProdsA.data)}`);
    }
    console.log('✓ User A product list contains only User A\'s products.');

    console.log('Fetching products for User B...');
    const getProdsB = await makeRequest('/api/products', 'GET', null, tokenB);
    if (getProdsB.data.length !== 1 || getProdsB.data[0].name !== 'Deluxe Cake Slice') {
      throw new Error(`User B product query returned incorrect elements: ${JSON.stringify(getProdsB.data)}`);
    }
    console.log('✓ User B product list contains only User B\'s products.');

    console.log('Attempting to update User A\'s product using User B\'s token (should fail 404)...');
    const updateProdByBob = await makeRequest(`/api/products/${prodAId}`, 'PUT', {
      name: 'Bob Hacked Apple',
      productId: 'SKU-999',
      basePrice: 10,
      hsnSacCode: 'SAC888',
      gstRate: 18
    }, tokenB);
    if (updateProdByBob.status !== 404) {
      throw new Error(`Expected 404 when updating another user's product, got ${updateProdByBob.status}`);
    }
    console.log('✓ Unauthorized product update rejected.');

    console.log('Attempting to delete User A\'s product using User B\'s token (should fail 404)...');
    const deleteProdByBob = await makeRequest(`/api/products/${prodAId}`, 'DELETE', null, tokenB);
    if (deleteProdByBob.status !== 404) {
      throw new Error(`Expected 404 when deleting another user's product, got ${deleteProdByBob.status}`);
    }
    console.log('✓ Unauthorized product deletion rejected.');

    // --- TEST 8: Invoice Generation Isolation, Math & Snapshots ---
    console.log('\n[Test 8] Generating Invoice for User A...');
    // Alice is a Regular Taxpayer, so GST calculations will apply:
    // P1 (Super Apple Service): Base Price = 500, Qty = 2, Discount = 10%, GST = 18%
    // Subtotal = 500 * 2 = 1000. Discount = 10% * 1000 = 100. Taxable value = 900.
    // CGST = 900 * 9% = 81. SGST = 900 * 9% = 81. Grand Total = 900 + 81 + 81 = 1062.
    const invoiceAData = {
      invoiceNumber: 'INV-A01',
      clientName: 'Google Inc.',
      clientAddress: '1600 Amphitheatre Pkwy, Mountain View, CA',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days out
      lineItems: [
        {
          name: 'Super Apple Service',
          productId: 'SKU-999',
          basePrice: 500,
          hsnSacCode: 'SAC888',
          gstRate: 18,
          quantity: 2,
          discountPercentage: 10
        }
      ]
    };

    const addInvA = await makeRequest('/api/invoices', 'POST', invoiceAData, tokenA);
    if (addInvA.status !== 201) {
      throw new Error(`Failed to generate invoice for User A: ${JSON.stringify(addInvA.data)}`);
    }
    const invA = addInvA.data;
    if (invA.taxableValueSum !== 900 || invA.cgstSum !== 81 || invA.sgstSum !== 81 || invA.grandTotal !== 1062) {
      throw new Error(`User A invoice math failed: ${JSON.stringify(invA)}`);
    }
    if (invA.enterpriseProfileSnapshot.registrationType !== 'Regular Taxpayer' || invA.enterpriseProfileSnapshot.gstin !== '29AAAAA1111A1Z1') {
      throw new Error(`User A invoice profile snapshot incorrect: ${JSON.stringify(invA.enterpriseProfileSnapshot)}`);
    }
    console.log('✓ User A invoice generated with correct Regular Taxpayer calculations and snapshot.');

    console.log('Generating Invoice for User B...');
    // Bob is a Composition Scheme business:
    // Bob's P2: Base Price = 150, Qty = 10, Discount = 0%, GST = 5%
    // Since Bob is Composition Scheme, tax should NOT be collected from client!
    // Subtotal = 150 * 10 = 1500. Discount = 0. Taxable value = 1500.
    // CGST = 0, SGST = 0. Grand Total = 1500.
    // Also, let's use the SAME invoiceNumber 'INV-A01' to verify compound unique index.
    const invoiceBData = {
      invoiceNumber: 'INV-A01', // Compound uniqueness check
      clientName: 'Bread & Butter Corp',
      clientAddress: 'Baker Street, Mumbai',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      lineItems: [
        {
          name: 'Deluxe Cake Slice',
          productId: 'SKU-999',
          basePrice: 150,
          hsnSacCode: 'HSN555',
          gstRate: 5,
          quantity: 10,
          discountPercentage: 0
        }
      ]
    };

    const addInvB = await makeRequest('/api/invoices', 'POST', invoiceBData, tokenB);
    if (addInvB.status !== 201) {
      throw new Error(`Failed to generate invoice for User B (compound index failed?): ${JSON.stringify(addInvB.data)}`);
    }
    const invB = addInvB.data;
    if (invB.taxableValueSum !== 1500 || invB.cgstSum !== 0 || invB.sgstSum !== 0 || invB.grandTotal !== 1500) {
      throw new Error(`User B invoice math failed (tax is still computed?): ${JSON.stringify(invB)}`);
    }
    if (invB.enterpriseProfileSnapshot.registrationType !== 'Composition Scheme' || invB.enterpriseProfileSnapshot.gstin !== '27BBBBB2222B2Z2') {
      throw new Error(`User B invoice profile snapshot incorrect: ${JSON.stringify(invB.enterpriseProfileSnapshot)}`);
    }
    console.log('✓ User B invoice generated with correct Composition Scheme calculations (zero GST collected) and snapshot.');
    console.log('✓ Compound uniqueness on invoiceNumber per user verified.');

    console.log('Attempting to create duplicate invoice INV-A01 for User A (should fail)...');
    const addInvADup = await makeRequest('/api/invoices', 'POST', {
      invoiceNumber: 'INV-A01',
      clientName: 'Google Inc.',
      clientAddress: '1600 Amphitheatre Pkwy, Mountain View, CA',
      dueDate: new Date(),
      lineItems: [
        {
          name: 'Super Apple Service',
          productId: 'SKU-999',
          basePrice: 500,
          hsnSacCode: 'SAC888',
          gstRate: 18,
          quantity: 1
        }
      ]
    }, tokenA);
    if (addInvADup.status !== 400) {
      throw new Error(`Expected 400 duplicate key error for User A duplicate invoice, got ${addInvADup.status}`);
    }
    console.log('✓ Duplicate invoice number rejected correctly for the same user.');

    console.log('Fetching invoices for User A...');
    const getInvsA = await makeRequest('/api/invoices', 'GET', null, tokenA);
    if (getInvsA.data.length !== 1 || getInvsA.data[0].invoiceNumber !== 'INV-A01' || getInvsA.data[0].clientName !== 'Google Inc.') {
      throw new Error(`User A invoice query returned incorrect elements: ${JSON.stringify(getInvsA.data)}`);
    }
    console.log('✓ User A invoice list contains only User A\'s invoices.');

    console.log('Fetching invoices for User B...');
    const getInvsB = await makeRequest('/api/invoices', 'GET', null, tokenB);
    if (getInvsB.data.length !== 1 || getInvsB.data[0].invoiceNumber !== 'INV-A01' || getInvsB.data[0].clientName !== 'Bread & Butter Corp') {
      throw new Error(`User B invoice query returned incorrect elements: ${JSON.stringify(getInvsB.data)}`);
    }
    console.log('✓ User B invoice list contains only User B\'s invoices.');

    console.log('\n[Test 9] Testing Invoice Status Toggle and Analytics summary...');
    console.log('Fetching analytics for User A...');
    const analyticA1 = await makeRequest('/api/analytics/summary', 'GET', null, tokenA);
    if (analyticA1.status !== 200) {
      throw new Error(`Failed to load analytics for User A: ${JSON.stringify(analyticA1.data)}`);
    }
    const dataA1 = analyticA1.data;
    if (dataA1.summary.totalRevenue !== 1062 || dataA1.summary.invoiceCount !== 1 || dataA1.summary.pendingCount !== 1 || dataA1.summary.paidCount !== 0) {
      throw new Error(`User A initial analytics summary incorrect: ${JSON.stringify(dataA1)}`);
    }
    if (dataA1.topProducts.length !== 1 || dataA1.topProducts[0].name !== 'Super Apple Service') {
      throw new Error(`User A top products calculation incorrect: ${JSON.stringify(dataA1.topProducts)}`);
    }

    console.log('Toggling Invoice Status for User A to Paid...');
    const invoiceId = getInvsA.data[0]._id;
    const toggleA = await makeRequest(`/api/invoices/${invoiceId}/status`, 'PUT', { status: 'Paid' }, tokenA);
    if (toggleA.status !== 200 || toggleA.data.status !== 'Paid') {
      throw new Error(`Failed to update invoice status for User A: ${JSON.stringify(toggleA.data)}`);
    }
    console.log('✓ Invoice status toggle successful.');

    console.log('Fetching updated analytics for User A...');
    const analyticA2 = await makeRequest('/api/analytics/summary', 'GET', null, tokenA);
    if (analyticA2.status !== 200) {
      throw new Error(`Failed to reload analytics for User A: ${JSON.stringify(analyticA2.data)}`);
    }
    const dataA2 = analyticA2.data;
    if (dataA2.summary.paidCount !== 1 || dataA2.summary.pendingCount !== 0 || dataA2.summary.paidAmount !== 1062 || dataA2.summary.pendingAmount !== 0) {
      throw new Error(`User A updated analytics summary incorrect: ${JSON.stringify(dataA2)}`);
    }
    console.log('✓ User A analytics correctly computed paid/pending transitions.');

    console.log('Fetching analytics for User B to verify isolation...');
    const analyticB = await makeRequest('/api/analytics/summary', 'GET', null, tokenB);
    if (analyticB.status !== 200) {
      throw new Error(`Failed to load analytics for User B: ${JSON.stringify(analyticB.data)}`);
    }
    const dataB = analyticB.data;
    if (dataB.summary.totalRevenue !== 1500 || dataB.summary.pendingCount !== 1 || dataB.summary.paidCount !== 0) {
      throw new Error(`User B analytics summary incorrect (or isolation failed): ${JSON.stringify(dataB)}`);
    }
    console.log('✓ User B analytics details isolated successfully.');

    console.log('\n--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error(`\n❌ TEST FAILURE: ${error.message}`);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    if (server) {
      console.log('Closing test server...');
      server.close();
    }
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    if (mongoServer) {
      console.log('Stopping MongoMemoryServer...');
      await mongoServer.stop();
    }
    console.log('Tests completed.');
  }
}

runTests();
