module.exports = {
  'register user, log in, create tweet, delete tweet' : function (browser) {
    const time = Date.now()
    browser
      .url('http://localhost:3000/')
      .waitForElementVisible('body')
      .assert.titleContains('Twitter v2.0')
      //register new account
      .assert.visible('button#register')
      .setValue('#registerUsername', `nightwatchUN${time}`)
      .setValue('#registerPassword', 'nightwatchPW')
      .setValue('#registerEmail', `ericluby+${time}@comcast.net`)
      .click('button#register')
      .pause(1000)
      .dismissAlert()

      // log in
      .assert.visible('button#loginButton')
      .setValue('#loginUsername', `nightwatchUN${time}`)
      .setValue('#loginPassword', 'nightwatchPW')
      .click('button#loginButton')
      .pause(1000)
      .dismissAlert()
      .waitForElementVisible('button#logoutButton')

      // create new tweet
      .setValue('input#message', `nightwatch testing here at ${time}`)
      .click('button#messageButton')
      .pause(1000)
      .dismissAlert()
      // read tweets
      .pause(1000)
      .assert.containsText('li:last-child', `nightwatch testing here at ${time}`)
      // delete tweet
      .click('li:last-child>button')
      .pause(1000)
      .dismissAlert()
      // read tweets
      .pause(1000)
      .assert.not.containsText('li:last-child', `nightwatch testing here at ${time}`)
      .end();
  }
};
