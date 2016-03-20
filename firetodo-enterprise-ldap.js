/**
 * The zero-factor enterprise LDAP back-end used in the Firetodo example. The
 * roles and details are kept on your trusted server, signed, passed to the
 * client, which then uses it in an auth() call to Firebase. The token is
 * verified by the Firebase backend using the shared secret key.
 *
 * This node process is running at http://misc.firebase.com:22222 which is
 * what firetodo.js is configured to look at. If you want to run this on
 * your own machine, be sure to fetch the latest version of
 * https://static.firebase.com/v0/firebase-token-generator.js and change the
 * URL in firetodo.js. You'll need node v0.6.3+.
 */

var users = {
  // Alice is the only manager in the system
  alice: { username: 'alice', manager: true },
  bob:   { username: 'bob',   manager: false},
  carol: { username: 'carol', manager: false}
};

var guest  = { username: 'guest', manager: false };

var url = require('url');
var http = require('http');

var FirebaseTokenGenerator = require("./firebase-token-generator-node.js");
var tokenGenerator = new FirebaseTokenGenerator(
  'FIXME --- Your Firebase namespace secret ---FIXME'
);

http.createServer(function(req, res) {
  try {
    // Grab the query parameters.
    var query = url.parse(req.url, true).query;

    // By default, return the guest user.
    var returnedUser = guest;
    if (query != null && query.user != null && users[query.user] != null) {
      // ... otherwise, use the super secret enterprise LDAP from above.
      returnedUser = users[query.user];
    }
  
    // Create the Firebase auth token for the payload that we would like
    // Firebase to treat as trusted.
    var token = tokenGenerator.createToken(returnedUser);

    // Send the signed token back to the client.
    res.writeHead(200, {
      'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({firebaseAuthToken: token}));
  } catch(err) {
    console.log(err);
  };
}).listen(22222, "127.0.0.1");
