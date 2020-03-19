var test = require('tape');
const isValidPassword = require("./passwordUtils.js").isValidPassword

test('When password + hash is valid', function (t) {
    t.plan(1);
    t.equal(isValidPassword('berry', '$2a$08$5p9pB9/dKcKsxCM/53lGP.5P2beUCbrRu1dscP4iB0cJvnpznfXGS'), true);
    t.end()
});

test('When password + hash is invalid', function (t) {
    t.plan(1);
    t.equal(isValidPassword('pumpkin', '$2a$08$5p9pB9/dKcKsxCM/53lGP.5P2beUCbrRu1dscP4iB0cJvnpznfXGS'), false);
    t.end()
});
