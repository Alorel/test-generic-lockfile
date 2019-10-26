const ref = process.env.GITHUB_REF;
let branchName = '';
if (ref) {
  branchName = ref.replace(/^refs\/heads\//, '');
}

console.log(`::set-output name=branchName,::${branchName}`);
