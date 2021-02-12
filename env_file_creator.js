const prompt = require('prompt');
const fs = require('fs');
const path = require('path');

const variables = ['apiKey'];

let fileContent =  'export const ENV = {';

prompt.start();
prompt.get(variables, (err, result) => {
  if (err) {
    console.error(err);
    return 1;
  }

  variables.forEach(variable => {
    fileContent += `${variable}: '${result[variable]}',`;
  });

  fileContent += '};';

  fs.writeFileSync(path.join(__dirname, 'src', 'env', 'env.ts'), fileContent);
  fs.writeFileSync(path.join(__dirname, 'svelte-project', 'env', 'env.ts'), fileContent);
});

