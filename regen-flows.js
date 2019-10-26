const fs = require('fs');
const {join} = require('path');

const rev = '4e49edd6802be4c5238f5dcda5072fd6a54d3c01';
const dir = join(__dirname, '.github', 'workflows');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, {recursive: true});
}

function makeVariation(isMaster) {
  const lockfileEnv = {
    GK_LOCK_GENERIC_CI: 'true',
    GK_LOCK_GENERIC_CI_REPO_SLUG: '${{ github.repository }}',
    GK_LOCK_GENERIC_CI_BRANCH_NAME: '${{ steps.bname.outputs.branchName }}',
    GK_LOCK_GENERIC_CI_FIRST_PUSH: isMaster ? 'false' : 'true',
    GK_LOCK_GENERIC_CI_CORRECT_BUILD: 'true',
    GK_LOCK_GENERIC_CI_UPLOAD_BUILD: isMaster ? 'false' : 'true',
    GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
  };

  return {
    name: `Build (${isMaster ? 'master' : 'non-master'})`,
    on: {
      push: {
        [isMaster ? 'branches' : 'branches-ignore']: 'master'
      }
    },
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@master',
            with: {
              'fetch-depth': 2
            }
          },
          {
            name: 'Get branch name',
            uses: './.github/actions/parse-gk-lockfile-vars',
            id: 'bname'
          },
          {
            name: 'Setup node',
            uses: 'actions/setup-node@master',
            with: {
              'node-version': '12.x'
            }
          },
          {
            name: 'Install GK lockfile',
            run: `npm install -g github:Alorel/greenkeeper-lockfile#${rev}`
          },
          {
            name: 'Update GK lockfile',
            env: lockfileEnv,
            run: 'greenkeeper-lockfile-update'
          },
          {
            name: 'npm install',
            run: 'npm install'
          },
          {
            name: 'Upload GK lockfile',
            env: lockfileEnv,
            run: 'greenkeeper-lockfile-upload'
          }
        ]
      }
    }
  }
}

const YAML = require('yamljs');
fs.writeFileSync(join(dir, 'master.yml'), YAML.stringify(makeVariation(true), 500, 2));
fs.writeFileSync(join(dir, 'non-master.yml'), YAML.stringify(makeVariation(false), 500, 2));
