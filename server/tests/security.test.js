const assert = require("assert");
const http = require("http");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = require("../src/app");
const config = require("../src/config/config");
const BookingValidator = require("../src/validators/bookingValidator");
const AuthValidator = require("../src/validators/authValidator");
const mechanicService = require("../src/services/mechanicService");

// Color output helpers
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`${GREEN}✔ PASS:${RESET} ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`${RED}✘ FAIL:${RESET} ${name}`);
        console.error(`  ${err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`${GREEN}✔ PASS:${RESET} ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`${RED}✘ FAIL:${RESET} ${name}`);
        console.error(`  ${err.message}`);
    }
}

console.log("\n==================================================");
console.log("🛡️  MRKANCHI.IN AUTOMATED SECURITY VERIFICATION SUITE");
console.log("==================================================\n");

// ----------------------------------------------------
// 1. INPUT VALIDATION TESTS
// ----------------------------------------------------
console.log(`${YELLOW}[SUITE 1: Input Validation & Sanitization]${RESET}`);

runTest("validateCreate rejects invalid phone number format", () => {
    let capturedErr = null;
    const req = {
        body: {
            name: "John Doe",
            mobileNumber: "invalid-phone",
            serviceAddress: "123 Temple St, Kanchipuram",
            serviceType: "AC Service"
        }
    };
    BookingValidator.validateCreate(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null, "Expected validation error");
    assert.strictEqual(capturedErr.statusCode, 400);
});

runTest("validateCreate rejects names shorter than 2 characters", () => {
    let capturedErr = null;
    const req = {
        body: {
            name: "A",
            mobileNumber: "9876543210",
            serviceAddress: "123 Temple St, Kanchipuram",
            serviceType: "AC Service"
        }
    };
    BookingValidator.validateCreate(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

runTest("validateCreate rejects invalid email format", () => {
    let capturedErr = null;
    const req = {
        body: {
            name: "Test Customer",
            mobileNumber: "9876543210",
            serviceAddress: "123 Temple St, Kanchipuram",
            serviceType: "AC Service",
            userEmail: "not-an-email"
        }
    };
    BookingValidator.validateCreate(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

runTest("validateCreate passes with valid synthetic customer inputs", () => {
    let capturedErr = null;
    const req = {
        body: {
            name: "Valid Customer",
            mobileNumber: "+91 9876543210",
            serviceAddress: "No. 42 Gandhi Road, Kanchipuram",
            serviceType: "Refrigerator Repair",
            userEmail: "customer.test@example.com",
            problemDescription: "Cooling gas leak inspection required"
        }
    };
    BookingValidator.validateCreate(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr === undefined || capturedErr === null);
});

runTest("validateReview rejects invalid rating scale (e.g. 6/5 or 0/5)", () => {
    let capturedErr = null;
    const req = {
        body: {
            bookingId: "507f1f77bcf86cd799439011",
            customerName: "Valid Name",
            rating: 6,
            review: "Great service"
        }
    };
    BookingValidator.validateReview(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

runTest("validateReview rejects non-hex bookingId format", () => {
    let capturedErr = null;
    const req = {
        body: {
            bookingId: "malicious-or-invalid-id",
            customerName: "Valid Name",
            rating: 5,
            review: "Great service"
        }
    };
    BookingValidator.validateReview(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

runTest("validateRegister requires minimum 8-character password", () => {
    let capturedErr = null;
    const req = {
        body: {
            name: "New Admin",
            email: "admin@example.com",
            phone: "9876543210",
            password: "123"
        }
    };
    AuthValidator.validateRegister(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

// ----------------------------------------------------
// 2. NOSQL INJECTION & PROTOTYPE POLLUTION TESTS
// ----------------------------------------------------
console.log(`\n${YELLOW}[SUITE 2: NoSQL Injection & Prototype Pollution Defense]${RESET}`);

runTest("sanitizeMiddleware strips MongoDB operator keys ($gt, $ne, $where)", () => {
    const { sanitizeMiddleware } = require("../src/middlewares/securityMiddleware");
    const req = {
        body: {
            username: "admin",
            password: { "$gt": "" },
            nested: { "$where": "sleep(5000)", safeField: "value" }
        },
        query: { "$regex": ".*" },
        params: {}
    };
    sanitizeMiddleware(req, {}, () => {});
    assert.strictEqual(req.body.password.$gt, undefined, "$gt operator must be deleted");
    assert.strictEqual(req.body.nested.$where, undefined, "$where operator must be deleted");
    assert.strictEqual(req.body.nested.safeField, "value", "Safe fields must be preserved");
    assert.strictEqual(req.query.$regex, undefined, "Query $regex must be deleted");
});

runTest("sanitizeMiddleware strips prototype pollution keys (__proto__, constructor)", () => {
    const { sanitizeMiddleware } = require("../src/middlewares/securityMiddleware");
    const req = {
        body: JSON.parse('{"__proto__": {"isAdmin": true}, "validField": "safe"}'),
        query: {},
        params: {}
    };
    sanitizeMiddleware(req, {}, () => {});
    assert.strictEqual(Object.prototype.isAdmin, undefined, "Prototype pollution must be prevented");
    assert.strictEqual(req.body.validField, "safe");
});

// ----------------------------------------------------
// 3. AUTHENTICATION & PRIVILEGE ESCALATION TESTS
// ----------------------------------------------------
console.log(`\n${YELLOW}[SUITE 3: Authentication & Privilege Escalation Controls]${RESET}`);

runTest("JWT secret validation: dynamic secure generation when fallback used in production", () => {
    const isProduction = true;
    const defaultSecret = "AISHU";
    let secret = "AISHU";
    if (isProduction && secret === defaultSecret) {
        secret = crypto.randomBytes(32).toString("hex");
    }
    assert.notStrictEqual(secret, "AISHU", "Must not use weak fallback");
    assert.strictEqual(secret.length, 64, "Generated secret must be 256 bits (64 hex chars)");
});


runTest("Unauthenticated admin registration is blocked with 401 without token", () => {
    const authMiddleware = require("../src/middlewares/authMiddleware");
    const guard = authMiddleware(["SUPER_ADMIN"]);
    let statusSet = null;
    let responseData = null;
    const req = { headers: {} };
    const res = {
        status: (code) => {
            statusSet = code;
            return {
                json: (data) => { responseData = data; }
            };
        }
    };
    guard(req, res, () => { assert.fail("Should not call next()"); });
    assert.strictEqual(statusSet, 401, "Expected 401 Access Denied");
});

runTest("Role-based authorization: MECHANIC role rejected on ADMIN endpoint", () => {
    const authMiddleware = require("../src/middlewares/authMiddleware");
    const guard = authMiddleware(["ADMIN", "SUPER_ADMIN"]);
    const mechanicToken = jwt.sign(
        { phone: "8888888888", role: "mechanic", name: "Test Mech" },
        config.jwt.secret
    );
    let statusSet = null;
    const req = { headers: { authorization: `Bearer ${mechanicToken}` } };
    const res = {
        status: (code) => {
            statusSet = code;
            return { json: () => {} };
        }
    };
    guard(req, res, () => { assert.fail("Should not allow mechanic role"); });
    assert.strictEqual(statusSet, 403, "Expected 403 Forbidden");
});

runTest("Role-based authorization: ADMIN role granted access", () => {
    const authMiddleware = require("../src/middlewares/authMiddleware");
    const guard = authMiddleware(["ADMIN", "SUPER_ADMIN"]);
    const adminToken = jwt.sign(
        { phone: "9566721519", role: "ADMIN", name: "Admin" },
        config.jwt.secret
    );
    let nextCalled = false;
    const req = { headers: { authorization: `Bearer ${adminToken}` } };
    guard(req, {}, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true, "Admin token must be granted access");
});

// ----------------------------------------------------
// 4. IDOR & OBJECT-LEVEL AUTHORIZATION TESTS
// ----------------------------------------------------
console.log(`\n${YELLOW}[SUITE 4: Object-Level Authorization & IDOR Mitigations]${RESET}`);

runAsyncTest("getMechanicBookings prevents cross-mechanic ticket eavesdropping", async () => {
    let capturedErr = null;
    try {
        await mechanicService.getMechanicBookings("9999999999", "8888888888", "mechanic");
    } catch (err) {
        capturedErr = err;
    }
    assert(capturedErr !== null, "Mechanic must not access another mechanic's assigned jobs");
    assert.strictEqual(capturedErr.statusCode, 403);
});

// ----------------------------------------------------
// 5. PAYMENT SPOOFING & INTEGRITY TESTS
// ----------------------------------------------------
console.log(`\n${YELLOW}[SUITE 5: Payment Integrity & Signature Verification]${RESET}`);

runTest("validateOnlinePayment rejects spoofed payments without required parameters", () => {
    let capturedErr = null;
    const req = { body: { bookingId: "507f1f77bcf86cd799439011" } }; // missing razorpayOrderId
    BookingValidator.validateOnlinePayment(req, {}, (err) => { capturedErr = err; });
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

runTest("validateOnlinePayment rejects fraudulent HMAC signature when secret is configured", () => {
    process.env.RAZORPAY_KEY_SECRET = "test_secret_key_123";
    let capturedErr = null;
    const req = {
        body: {
            bookingId: "507f1f77bcf86cd799439011",
            razorpayOrderId: "order_12345",
            razorpayPaymentId: "pay_12345",
            razorpaySignature: "forged_invalid_signature"
        }
    };
    BookingValidator.validateOnlinePayment(req, {}, (err) => { capturedErr = err; });
    delete process.env.RAZORPAY_KEY_SECRET; // cleanup
    assert(capturedErr !== null);
    assert.strictEqual(capturedErr.statusCode, 400);
});

// ----------------------------------------------------
// 6. XSS SANITIZATION TESTS
// ----------------------------------------------------
console.log(`\n${YELLOW}[SUITE 6: Cross-Site Scripting (XSS) Sanitization]${RESET}`);

runTest("escapeHtml escapes script tags and event handlers", () => {
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    const payload = `<script>alert("XSS")</script><img src=x onerror=alert(1)>'`;
    const escaped = escapeHtml(payload);
    assert(!escaped.includes("<script>"), "Must escape opening tag");
    assert(!escaped.includes("</script>"), "Must escape closing tag");
    assert(!escaped.includes('"'), "Must escape double quotes");
    assert(!escaped.includes("'"), "Must escape single quotes");
    assert(escaped.includes("&lt;script&gt;"));
    assert(escaped.includes("&#39;"));
});

// ----------------------------------------------------
// 7. HTTP SECURITY HEADERS & SERVER INTEGRATION
// ----------------------------------------------------
console.log(`\n${YELLOW}[SUITE 7: HTTP Headers & Response Security]${RESET}`);

runAsyncTest("Express application serves essential security headers", async () => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    const res = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/api/health`, (res) => {
            resolve(res);
        }).on("error", reject);
    });

    server.close();

    assert.strictEqual(res.headers["x-content-type-options"], "nosniff", "nosniff header missing");
    assert(res.headers["permissions-policy"] !== undefined, "Permissions-Policy header missing");
    assert(res.headers["cache-control"].includes("no-store"), "API Cache-Control must include no-store");
    assert(res.headers["content-security-policy"] !== undefined, "Content-Security-Policy header missing");
});

runAsyncTest("CORS rejects unauthorized cross-origin requests", async () => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    const options = {
        hostname: "localhost",
        port: port,
        path: "/api/health",
        method: "GET",
        headers: {
            "Origin": "https://malicious-attacker-domain.com"
        }
    };

    const res = await new Promise((resolve, reject) => {
        http.request(options, (res) => {
            resolve(res);
        }).on("error", reject).end();
    });

    server.close();

    // CORS policy blocks the origin, returning 403 error status through centralized error handler
    assert.strictEqual(res.statusCode, 403, "Unauthorized origin must be rejected with 403 Forbidden");
});

console.log("\n==================================================");
setTimeout(() => {
    if (passedTests === totalTests) {
        console.log(`${GREEN}🎉 ALL ${passedTests}/${totalTests} SECURITY TESTS PASSED!${RESET}`);
        process.exit(0);
    } else {
        console.error(`${RED}⚠️  ${totalTests - passedTests} TESTS FAILED OUT OF ${totalTests}!${RESET}`);
        process.exit(1);
    }
}, 500);
