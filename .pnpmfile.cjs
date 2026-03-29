function readPackage(pkg, context) {
  // drizzle-orm が引き込む Prisma へのオプション依存関係を強制的に削除する
  if (pkg.name === 'drizzle-orm' || pkg.name === 'drizzle-seed') {
    if (pkg.optionalDependencies) {
      delete pkg.optionalDependencies['prisma'];
      delete pkg.optionalDependencies['@prisma/client'];
      context.log(`Removed Prisma from optionalDependencies of ${pkg.name}`);
    }
    if (pkg.peerDependencies) {
      delete pkg.peerDependencies['prisma'];
      delete pkg.peerDependencies['@prisma/client'];
    }
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
