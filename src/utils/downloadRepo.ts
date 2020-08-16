const git = require('git-promise'); // 运行git命令

async function downloadRepo(repoPath:string, localPath:string, appName:string, branch:string) {
  const _branch = branch ? `-b ${branch} --` : '--';
  const _repoPath = `clone ${_branch} ${repoPath} ${localPath}`;
  // console.log('\ngit:', _repoPath)
  return git(_repoPath);
}

export default downloadRepo;
