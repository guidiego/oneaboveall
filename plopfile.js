const inquirer = require('inquirer');
const inquirerRecursive = require('inquirer-recursive');
const hbsHelper = require('handlebars-helpers')();

module.exports = function (plop) {
  plop.setPrompt('recursive', inquirerRecursive);
  plop.setHelper('inArray', hbsHelper.inArray);
  plop.setHelper('is', hbsHelper.is);

  plop.setGenerator('entity', {
    description: 'create an entity',
    prompts: [{
      type: "input",
      name: "EntityName",
      message: "What's the name of your entity",
    },
    {
      type: "confirm",
      name: "hasResolver",
      default: false,
      message: "Do you want to create a Resolver?",
    },
    {
      when: ({ hasResolver }) => hasResolver,
      type: "checkbox",
      name: "ResolverMethods",
      message: "What method do you want in your Resolver?",
      choices: ["findAll", "findOne", "paginate", "create", "update", "delete"]
    },
    {
      type: 'recursive',
      name: 'EntityProps',
      message: 'Do you want to add a new property to your entity?',
      prompts: [{
        type: 'input',
        name: 'PropName',
        message: "What's the name of your prop?"
      }, {
        type: 'list',
        name: 'PropType',
        message: "What's the type of your prop?",
        choices: ['String', 'Boolean', 'Number', 'Date', 'SetInCode']
      }, {
        type: 'checkbox',
        name: 'PropInserted',
        message: "What points do you want to insert your prop?",
        choices: ["Database", "GraphQL", "RequiredOnCreation", "CouldBeUpdated"]
      }]
    }],
    actions: ({ hasResolver }) => {
      const actions = [{
        type: 'add',
        path: './src/entity/{{EntityName}}.ts',
        templateFile: './scripts/entity/entity.hbs',
        abortOnFail: true,
      }, {
        type: 'add',
        path: './src/inputs/{{EntityName}}Input.ts',
        templateFile: './scripts/entity/input.hbs',
        abortOnFail: true,
      }];

      if (hasResolver) {
        actions.push({
          type: 'add',
          path: './src/resolvers/{{EntityName}}Resolver.ts',
          templateFile: './scripts/resolver/resolver.hbs',
          abortOnFail: true,
        })

        actions.push({
          type: 'add',
          path: './tests/unit/resolvers/{{EntityName}}Resolver.spec.ts',
          templateFile: './scripts/resolver/resolver.hbs',
          abortOnFail: true,
        })

        actions.push({
          path: './src/resolvers/index.ts',
          type: 'modify',
          pattern: /;\n\n/gim,
          template: ";\nimport { {{EntityName}}Resolver } from './{{EntityName}}Resolver';\n\n"
        })

        actions.push({
          path: './src/resolvers/index.ts',
          type: 'modify',
          pattern: /\] as NonEmptyArray/gim,
          template: "  {{EntityName}}Resolver,\n\] as NonEmptyArray"
        })

        actions.push({
          path: './src/entities.ts',
          type: 'append',
          template: "export { {{EntityName}} } from './entity/{{EntityName}}';"
        })
      }

      return actions;
    }
  });
};
