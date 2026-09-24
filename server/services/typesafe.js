const { TypeSafeClient, choice, score, noul } = require('@typesafe-ai/sdk');

/**
 * Shared TypeSafe Client instance
 * Automatically reads TYPESAFE_API_KEY from the environment
 */
const typeSafeClient = new TypeSafeClient();

module.exports = {
  typeSafeClient,
  choice,
  score,
  noul,
};
