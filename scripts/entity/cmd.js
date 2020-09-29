const resolverCmd = require('../resolver/cmd');

exports.prompts = [{
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
  ...resolverCmd._resolverMethodsCreatePrompt
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
}];

exports.actions = ({ hasResolver }) => {
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
  }, {
    path: './src/entities.ts',
    type: 'modify',
    pattern: /;\n\n/g,
    template: "export { {{EntityName}} } from './entity/{{EntityName}}';\n\n"
  }];

  if (hasResolver) {
    return actions.concat(resolverCmd.actions);
  }

  return actions;
}
