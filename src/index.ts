import { createApolloServer } from './apollo';
import { ENV, DEBUG, PORT } from './config';

const handler = ({ url }: { url: string }) =>
  ENV === 'development' ? console.log(`🚀 Server ready at ${url}`) : null;

createApolloServer({ env: ENV, debug: DEBUG }).then((server) => {
  return server.listen(PORT).then(handler)
});
