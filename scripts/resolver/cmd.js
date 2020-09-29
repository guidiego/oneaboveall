const fs = require('fs');

exports._resolverMethodsCreatePrompt = {
  type: "checkbox",
  name: "ResolverMethods",
  message: "What method do you want in your Resolver?",
  choices: ["findAll", "findOne", "paginate", "create", "update", "delete"]
};

exports.prompts = [
  {
    type: "list",
    name: "EntityName",
    message: "What's the entity that needs a resolver?",
    choices: fs.readdirSync('./src/entity').map((r) => r.replace('.ts', '')),
  },
  exports._resolverMethodsCreatePrompt,
];

exports.actions = [{
  type: 'add',
  path: './src/resolvers/{{EntityName}}Resolver.ts',
  templateFile: './scripts/resolver/resolver.hbs',
  abortOnFail: true,
}, {
  type: 'add',
  path: './tests/unit/resolvers/{{EntityName}}Resolver.spec.ts',
  templateFile: './scripts/resolver/resolver.hbs',
  abortOnFail: true,
}, {
  path: './src/resolvers/index.ts',
  type: 'modify',
  pattern: /;\n\n/gim,
  template: ";\nimport { {{EntityName}}Resolver } from './{{EntityName}}Resolver';\n\n"
}, {
  path: './src/resolvers/index.ts',
  type: 'modify',
  pattern: /\] as NonEmptyArray/gim,
  template: "  {{EntityName}}Resolver,\n\] as NonEmptyArray"
}];
