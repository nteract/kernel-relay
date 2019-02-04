/**
 * @module kernel-relay
 */
import { ApolloServer, Config, gql } from "apollo-server";
import GraphQLJSON from "graphql-type-json";

import { findAll, Kernel, launchKernel } from "@nteract/fs-kernels";
import { JupyterMessage, kernelInfoRequest } from "@nteract/messaging";

const Types = gql`
  scalar JSON

  type KernelSpec {
    id: ID!
    name: String
  }

  type KernelSession {
    id: ID!
    status: String
  }

  type Message {
    id: ID!
    payload: JSON
  }
`;

const Query = gql`
  type Query {
    listKernelSpecs: [KernelSpec!]!
    running: [KernelSession!]!
    messages: [Message!]!
  }
`;

const Mutation = gql`
  type Mutation {
    startKernel(name: String): KernelSession!
    shutdownKernel(id: ID): KernelSession!
  }
`;

interface StartKernel {
  name: string;
}

interface ShutdownKernel {
  id: string;
}

export const kernels: { [id: string]: Kernel } = {};

const messages: {
  [kernelId: string]: JupyterMessage[];
} = {};

const typeDefs = [Types, Query, Mutation];
const resolvers = {
  JSON: GraphQLJSON,
  Mutation: {
    startKernel: async (parentValue: any, args: StartKernel) => {
      const kernel = await launchKernel(args.name);

      console.log(`kernel ${args.name}:${kernel.connectionInfo.key} launched`);

      // NOTE: we should generate IDs
      // We're also setting a session ID within the enchannel-zmq setup, I wonder
      // if we should use that
      const id = kernel.connectionInfo.key;

      messages[id] = [];
      kernels[id] = kernel;

      const subscription = kernel.channels.subscribe(
        (message: JupyterMessage) => {
          messages[id].push(message);
        }
      );

      const request = kernelInfoRequest();
      messages[id].push(request);
      kernel.channels.next(request);

      // NOTE: We are going to want to both:
      //
      //   subscription.unsubscribe()
      //   AND
      //   kernel.channels.complete()
      //
      //   Within our cleanup code

      return {
        id,
        status: "launched"
      };
    },
    shutdownKernel: async (parentValue: any, args: ShutdownKernel) => {
      const { id } = args;
      const kernel = kernels[id];

      await kernel.shutdown();
      kernel.channels.unsubscribe();
      kernel.channels.complete();

      return {
        id,
        status: "shutdown"
      };
    }
  },
  Query: {
    listKernelSpecs: async () => {
      const kernelspecs = await findAll();

      return Object.keys(kernelspecs).map(key => {
        return {
          id: key,
          ...kernelspecs[key]
        };
      });
    },
    messages: () => {
      return ([] as JupyterMessage[])
        .concat(...Object.values(messages))
        .map(message => ({ id: message.header.msg_id, payload: message }));
    },
    running: () => {
      return Object.keys(kernels).map(id => ({ id, status: "pretend" }));
    }
  }
};

export function createServer(options?: Config): ApolloServer {
  return new ApolloServer({
    introspection: true,
    // Since we're playing around, enable features for introspection and playing on our current deployment
    // If this gets used in a "real" production capacity, introspection and playground should be disabled
    // based on NODE_ENV === "production"
    playground: {
      /*tabs: [
        {
          endpoint: "",
          query: ``
        }
      ]*/
    },
    resolvers: resolvers as any,
    typeDefs,
    ...options
  });
}
