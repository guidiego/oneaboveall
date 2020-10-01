const { exec } = require("child_process");
const { writeFileSync, mkdirSync } = require('fs');

const DB_INSTALL = {
  'MySQL': ['mysql', {}],
  'SQL Lite': ['sqlite3', {}],
  'Microsoft SQL Server': ['mssql', {}],
  'Postgres': ['pg', {
    postgres: {
      image: 'postgres',
      ports: ["5432:5432"],
      environment: {
        POSTGRES_USER: "${DB_USER}",
        POSTGRES_PASSWORD: "${DB_PASSWORD}",
        POSTGRES_DB: "${DB_NAME}",
      },
      volumes: ["./data:/opt/postgres/data"]
    }
  }],
  'MongoDB': ['mongodb', {
    mongo: {
      image: "mongo",
      restart: "always",
      ports: ["27017:27017"]
    }
  }, (env) => {
    env.DB_TYPE = 'mongodb';
    env.DB_PORT = '27017';

    delete env.DB_USER;
    delete env.DB_PASSWORD;

    return env;
  }],
  'Oracle': ['oracledb', {}],
};

const envMutateLambda = (envData) => {
  envData.LAMBDA_DEPLOY = true;
  envData.APOLLO_SUFFIX = '-lambda';
  return envData;
};

const DEPLOY_SUPPORT = {
  'Default (Server Host)': {
    composeMutate: (compose) => {
      compose.services.app = {
        build: '.',
        env_file: [".env.${NODE_ENV}"],
        ports: ["${PORT}:${PORT}"],
      }

      return compose;
    }
  },
  'Serverless': {
    deeps: ['apollo-server-lambda'],
    envMutate: envMutateLambda,
    postActions: 'cp scripts/infra/serveless.yml .'
  },
  'Serverless Netlify': {
    deeps: ['apollo-server-lambda', 'netlify-lambda'],
    envMutate: envMutateLambda,
    packageMutate: (package) => {
      package.scripts.serve = 'netlify-lambda serve dist/apollo'
    }
  },
  'Serverless Azure': {
    deeps: ['apollo-server-azure-functions'],
    envMutate: (envData) => ({ ...envMutateLambda(envData), APOLLO_SUFFIX: '-azure-functions'}),
  },
}

const baseDockerCompose = {
  version: '3.2',
  services: {}
}


console.log('Installing deeps....');
exec('yarn install && yarn add yaml && git remote get-url origin', (error, stdout) => {
  const inquirer = require('inquirer');
  const gitRepo = stdout.split(':')[1].replace('.git', '').trim();
  console.log('Preparing project...');

  inquirer.prompt([{
    type: 'input',
    name: 'gitRepo',
    message: 'What\'s the GitHub repo?',
    default: gitRepo,
  }, {
    type: 'list',
    name: 'dbName',
    message: 'What\'s DB you want to use?',
    choices: Object.keys(DB_INSTALL),
  }, {
    type: 'list',
    name: 'deployTypeName',
    message: 'What\'s deploy do you want to use?',
    choices: Object.keys(DEPLOY_SUPPORT),
  }]).then(({ dbName, gitRepo, deployTypeName }) => {
    const deployType = DEPLOY_SUPPORT[deployTypeName];
    const projectName = gitRepo.split('/')[1];
    const package = require('../package.json');
    const dbSettings = DB_INSTALL[dbName];

    package.name = projectName;
    package.bugs = `https://github.com/${gitRepo}/issues`;
    package.homepage = `https://github.com/${gitRepo}#readme`;

    delete package.scripts.setup;

    if (deployType.packageMutate) {
      Object.assign(package, deployType.packageMutate(package));
    }

    console.log('Saving changes...');
    writeFileSync('./package.json', JSON.stringify(package, null, 2), { encoding: 'utf-8' });

    console.log('Installing new deeps...');''
    const deeps = dbSettings[0] + deployType.deeps ? ` ${deployType.deeps.join(' ')}` : '';

    exec(`yarn add ${deeps} -S`, () => {
      console.log('Creating DockerCompose...');
      baseDockerCompose.services = { ...baseDockerCompose.services, ...dbSettings[1]}
      writeFileSync('./docker-compose.yml', require('yaml').stringify(
        deployType.composeMutate ? deployType.composeMutate(baseDockerCompose) : baseDockerCompose
      ), { encoding: 'utf-8' });

      console.log('Creating .env.development...')
      const envFileData = require('dotenv').config().parsed;
      const devEnvData = dbSettings[2] ? dbSettings[2](envFileData) : envFileData;
      const envFinalData = deployType.envMutate ? deployType.envMutate(devEnvData) : devEnvData;
      const devEnvFile = Object.keys(envFinalData).reduce((a, b) => a + `${b}=${envFinalData[b]}\n`, '');
      writeFileSync('.env.development', devEnvFile, { encoding: 'utf-8' });
      mkdirSync('./src/entity');

      console.log('Clean up...');

      const finalActions = (deployType.postActions ? `${deployType.postActions} &&` : '') + 'yarn remove yaml'
      exec(finalActions, () => {
        console.log('Done!')
      });
    })
  });
});
