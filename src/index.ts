import { createServer, kernels } from "./server";

async function main() {
  // In the most basic sense, the ApolloServer can be started
  // by passing type definitions (typeDefs) and the resolvers
  // responsible for fetching the data for those types.
  const server = createServer();
  // This `listen` method launches a web-server.  Existing apps
  // can utilize middleware options, which we'll discuss later.
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

process.on("exit", () => {
  Object.keys(kernels).map(async id => {
    console.log("shutting down ", id);
    await kernels[id].shutdown();
  });
});

main();
