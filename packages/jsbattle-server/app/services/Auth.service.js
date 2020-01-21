const Service = require("moleculer").Service;
const { ValidationError } = require("moleculer").Errors;
const jsonwebtoken = require("jsonwebtoken");
const _ = require('lodash');
const crypto = require('crypto');

const JWT_SECRET = crypto.randomBytes(256).toString('base64');
const JWT_FIELDS = [
  'userId',
  'username',
  'role'
];

class AuthService extends Service {

  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: "auth",
      actions: {
        authorize: this.authorize,
        resolveToken: this.resolveToken,
        whoami: this.whoami
      },
      events: {
        "user.login": async (userId) => {
          await broker.call("userStore.update", {id: userId, lastLoginAt: new Date()});
        }
      }
    });
  }

  whoami(ctx) {
    let userId = ctx.meta.user.userId;
    let user = ctx.call('userStore.get', {id: userId});
    return user;
  }

  authorize(ctx) {
    if(!ctx.params.user) {
      throw new ValidationError('user parameter is required', 400);
    }
    let user = _.pick(ctx.params.user, JWT_FIELDS)
    return {
      token: jsonwebtoken.sign(
        user,
        JWT_SECRET,
        {
          expiresIn: '1d'
        }
      )
    }
  }

  resolveToken(ctx) {
    if(!ctx.params.token) {
      throw new ValidationError('token parameter is required', 400);
    }
    let user = jsonwebtoken.verify(ctx.params.token, JWT_SECRET);
    return _.pick(user, JWT_FIELDS);
  }

}

module.exports = AuthService;