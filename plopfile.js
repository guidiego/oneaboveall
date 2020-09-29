const inquirerRecursive = require('inquirer-recursive');
const hbsHelper = require('handlebars-helpers')();

const entityCmd = require('./scripts/entity/cmd');
const resolverCmd = require('./scripts/resolver/cmd');

module.exports = function (plop) {
  plop.setPrompt('recursive', inquirerRecursive);
  plop.setHelper('inArray', hbsHelper.inArray);
  plop.setHelper('is', hbsHelper.is);

  plop.setGenerator('entity', {
    description: 'create an entity',
    prompts: entityCmd.prompts,
    actions: entityCmd.actions,
  });

  plop.setGenerator('resolver', {
    description: 'create an resolver',
    prompts: resolverCmd.prompts,
    actions: resolverCmd.actions,
  });
};
