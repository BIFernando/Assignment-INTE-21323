const BASE_URL = process.env.TEST_URL || 'http://54.82.96.86:5000';

let authToken = '';

async function runTests() {
console.log('Running TMS API Functional Tests...');
console.log('Base URL:', BASE_URL);
console.log('─'.repeat(50));

let passed = 0;
let failed = 0;

async function test(name, fn) {
try {
await fn();
console.log('✅ PASS:', name);
passed++;
} catch (err) {
console.log('❌ FAIL:', name);
console.log('   Error:', err.message);
failed++;
}
}

function expect(actual, expected, message) {
if (actual !== expected) {
throw new Error(
message || `Expected ${expected} but got ${actual}`
);
}
}

// TEST 1 - Login valid credentials
await test('Login with valid credentials', async () => {
const res = await fetch(BASE_URL + '/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
email: 'admin@tms.com',
password: 'Password123!'
})
});


expect(res.status, 200);

const data = await res.json();

if (!data.token) {
  throw new Error('Token not returned');
}

authToken = data.token;


});

// TEST 2 - Wrong password
await test('Login with wrong password', async () => {
const res = await fetch(BASE_URL + '/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
email: 'admin@tms.com',
password: 'wrongpassword'
})
});


expect(res.status, 401);


});

// TEST 3 - Missing email
await test('Login missing email', async () => {
const res = await fetch(BASE_URL + '/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
password: 'Password123!'
})
});


expect(res.status, 400);


});

// TEST 4 - Users with token
await test('Get users with token', async () => {
const res = await fetch(BASE_URL + '/api/users', {
headers: {
Authorization: 'Bearer ' + authToken
}
});


expect(res.status, 200);


});

// TEST 5 - Users without token
await test('Get users without token', async () => {
const res = await fetch(BASE_URL + '/api/users');


expect(res.status, 401);


});

// TEST 6 - Projects with token
await test('Get projects with token', async () => {
const res = await fetch(BASE_URL + '/api/projects', {
headers: {
Authorization: 'Bearer ' + authToken
}
});


expect(res.status, 200);


});

// TEST 7 - Tasks with token
await test('Get tasks with token', async () => {
const res = await fetch(BASE_URL + '/api/tasks', {
headers: {
Authorization: 'Bearer ' + authToken
}
});


expect(res.status, 200);


});

// TEST 8 - Notifications with token
await test('Get notifications with token', async () => {
const res = await fetch(BASE_URL + '/api/notifications', {
headers: {
Authorization: 'Bearer ' + authToken
}
});


expect(res.status, 200);


});

// TEST 9 - Invalid route
await test('Invalid route returns 404', async () => {
const res = await fetch(BASE_URL + '/api/not-found');


expect(res.status, 404);


});

console.log('─'.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
console.log('🎉 All tests passed!');
} else {
process.exit(1);
}
}

runTests().catch(err => {
console.error(err);
process.exit(1);
});
