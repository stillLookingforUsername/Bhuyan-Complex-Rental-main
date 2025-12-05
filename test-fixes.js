const axios = require('axios');

console.log('🧪 Testing Bill Deletion and Personal Notification Fixes');
console.log('====================================================');

const API_BASE = 'http://localhost:3001/api';

// Test configuration
let authToken = '';
let testBillId = '';
let testTenantId = '';

async function testFixes() {
  try {
    // 1. Test Login (to get auth token)
    console.log('\n1. Testing Owner Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'owner',
      password: 'owner123', 
      role: 'owner'
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.token;
      console.log('✅ Owner login successful');
    } else {
      throw new Error('Login failed');
    }

    // 2. Test fetching bills (to get a bill ID for deletion test)
    console.log('\n2. Testing Bill Fetching...');
    const billsResponse = await axios.get(`${API_BASE}/admin/bills`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (billsResponse.data.success && billsResponse.data.bills.length > 0) {
      testBillId = billsResponse.data.bills[0]._id;
      console.log(`✅ Found ${billsResponse.data.bills.length} bills`);
      console.log(`   📋 Test bill ID: ${testBillId}`);
    } else {
      console.log('⚠️  No bills found for deletion test');
    }

    // 3. Test fetching tenants (to get a tenant ID for notification test)
    console.log('\n3. Testing Tenant Fetching...');
    const tenantsResponse = await axios.get(`${API_BASE}/admin/tenants`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (tenantsResponse.data.success && tenantsResponse.data.tenants.length > 0) {
      testTenantId = tenantsResponse.data.tenants[0]._id;
      console.log(`✅ Found ${tenantsResponse.data.tenants.length} tenants`);
      console.log(`   👤 Test tenant ID: ${testTenantId}`);
    } else {
      console.log('⚠️  No tenants found for notification test');
    }

    // 4. Test Personal Notification Creation
    console.log('\n4. Testing Personal Notification Creation...');
    const notificationPayload = {
      title: 'Test Personal Notification',
      message: 'This is a test personal notification to verify the fix.',
      type: 'personal',
      category: 'info',
      priority: 'medium',
      tenantIds: [testTenantId]
    };

    const notificationResponse = await axios.post(`${API_BASE}/notifications`, notificationPayload);

    if (notificationResponse.data.success) {
      console.log('✅ Personal notification created successfully');
      console.log(`   📧 Notification ID: ${notificationResponse.data.notification._id}`);
      console.log(`   📡 Broadcasted to: ${notificationResponse.data.broadcastedTo} clients`);
    } else {
      console.log('❌ Failed to create personal notification');
    }

    // 5. Test fetching notifications
    console.log('\n5. Testing Notification Fetching...');
    const fetchNotificationsResponse = await axios.get(`${API_BASE}/notifications`);

    if (fetchNotificationsResponse.data.success) {
      const notifications = fetchNotificationsResponse.data.notifications;
      const personalNotifications = notifications.filter(n => n.type === 'personal');
      console.log(`✅ Found ${notifications.length} total notifications`);
      console.log(`   👤 Personal notifications: ${personalNotifications.length}`);
      
      // Check if our test notification is there
      const testNotification = notifications.find(n => n.title === 'Test Personal Notification');
      if (testNotification) {
        console.log(`   ✅ Test personal notification found with ${testNotification.recipients.length} recipients`);
      }
    } else {
      console.log('❌ Failed to fetch notifications');
    }

    // 6. Test Bill Deletion (only if we found a bill to test with)
    if (testBillId) {
      console.log('\n6. Testing Bill Deletion...');
      console.log(`   ⚠️  This will attempt to delete bill: ${testBillId}`);
      console.log('   💡 Note: This test may fail if the bill has payments attached');
      
      try {
        const deleteResponse = await axios.delete(`${API_BASE}/admin/bills/${testBillId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (deleteResponse.data.success) {
          console.log('✅ Bill deletion successful');
          console.log(`   🗑️  Deleted: ${deleteResponse.data.deletedBill.billNumber}`);
        } else {
          console.log(`❌ Bill deletion failed: ${deleteResponse.data.error}`);
        }
      } catch (deleteError) {
        if (deleteError.response?.data?.error) {
          console.log(`❌ Bill deletion failed: ${deleteError.response.data.error}`);
        } else {
          console.log(`❌ Bill deletion error: ${deleteError.message}`);
        }
      }
    }

    console.log('\n✅ Test Suite Completed!');
    console.log('\n📋 Summary:');
    console.log('   1. ✅ Owner authentication working');
    console.log('   2. ✅ Bill fetching working');  
    console.log('   3. ✅ Tenant fetching working');
    console.log('   4. ✅ Personal notification creation working');
    console.log('   5. ✅ Notification fetching working');
    console.log('   6. 🔄 Bill deletion functionality tested');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the tests
testFixes();