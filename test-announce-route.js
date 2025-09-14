// Test script to verify the /admin/announce/:round route works
import fetch from 'node-fetch';

const testAnnounceRoute = async () => {
    try {
        // Note: This will fail with authentication error, but we can see if the route exists
        const response = await fetch('http://localhost:5009/api/admin/announce/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token' // This will fail auth but route should exist
            }
        });

        const data = await response.json();

        if (response.status === 401) {
            console.log('✅ Route exists! Got expected 401 Unauthorized (authentication required)');
            console.log('Response:', data);
        } else if (response.status === 404) {
            console.log('❌ Route not found! Got 404');
        } else {
            console.log(`Got status ${response.status}:`, data);
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('⚠️  Server is not running. Start the server first with: npm start');
        } else {
            console.error('Error testing route:', error.message);
        }
    }
};

testAnnounceRoute();
