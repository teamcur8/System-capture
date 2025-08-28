const https = require('https');
const querystring = require('querystring');

function makeHttpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`DEBUG: Making HTTPS request to: ${url}`);
        console.log(`DEBUG: Request options:`, options);
        
        const req = https.request(url, options, (res) => {
            console.log(`DEBUG: Response status: ${res.statusCode}`);
            console.log(`DEBUG: Response headers:`, res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`DEBUG: Response data: ${data}`);
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    console.log(`DEBUG: Failed to parse JSON, returning raw data`);
                    resolve(data);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`DEBUG: Request error:`, err);
            reject(err);
        });

        if (options.data) {
            console.log(`DEBUG: Writing data: ${options.data}`);
            req.write(options.data);
        }
        req.end();
    });
}

async function testLogin(email, password) {
    try {
        console.log(`DEBUG: Testing login for email: ${email}`);
        
        // First API call - Authentication
        const authUrl = "https://transform.cur8.in/webservice/rest/server.php";
        const authParams = {
            "wstoken": "55d122d76ce0b08e792ce0d4f680b1d2",
            "wsfunction": "local_courses_get_user_details_data",
            "moodlewsrestformat": "json"
        };

        // Build the full URL with query parameters
        const fullAuthUrl = `${authUrl}?${querystring.stringify(authParams)}`;
        console.log(`DEBUG: Full auth URL: ${fullAuthUrl}`);

        const postData = querystring.stringify({
            "u_email": email,
            "u_password": password
        });
        console.log(`DEBUG: Post data: ${postData}`);

        const authResult = await makeHttpsRequest(fullAuthUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Echo-Desktop-App/1.0'
            },
            data: postData
        });

        console.log(`DEBUG: Auth result type: ${typeof authResult}`);
        console.log(`DEBUG: Auth result:`, authResult);
        
        if (authResult && Array.isArray(authResult) && authResult.length > 0) {
            console.log(`DEBUG: Auth successful, user data:`, authResult[0]);
            return { success: true, userData: authResult[0] };
        } else {
            console.log(`DEBUG: Auth failed - invalid result format`);
            return { success: false, error: 'Invalid credentials' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Test with sample credentials (replace with actual test credentials)
const testEmail = "test@example.com"; // Replace with actual test email
const testPassword = "testpassword";   // Replace with actual test password

console.log("Testing login API...");
testLogin(testEmail, testPassword)
    .then(result => {
        console.log("Test result:", result);
        process.exit(0);
    })
    .catch(error => {
        console.error("Test failed:", error);
        process.exit(1);
    });
