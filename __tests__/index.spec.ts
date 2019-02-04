import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { createServer } from "../src/server";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "kernel1")
}));

jest.mock("@nteract/fs-kernels", () => ({
  async findAll() {
    return {
      python3: {
        name: "python3",
        files: [
          "/Users/jovyan/Library/Jupyter/kernels/python3/kernel.json",
          "/Users/jovyan/Library/Jupyter/kernels/python3/logo-32x32.png",
          "/Users/jovyan/Library/Jupyter/kernels/python3/logo-64x64.png"
        ],
        resource_dir: "/Users/jovyan/Library/Jupyter/kernels/python3",
        spec: {
          argv: [
            "/usr/local/bin/python3",
            "-m",
            "ipykernel_launcher",
            "-f",
            "{connection_file}"
          ],
          env: {},
          display_name: "Python 3",
          language: "python",
          interrupt_mode: "signal"
        }
      }
    };
  },
  async launchKernel(name: string) {
    return {
      connectionInfo: {
        key: "kernel1"
      },
      shutdown: jest.fn(),
      channels: {
        next: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        complete: jest.fn()
      }
    };
  }
}));

describe("Queries", () => {
  it("returns a list of kernelspecs", async () => {
    const { query } = createTestClient(createServer());
    const LIST_KERNELSPECS = gql`
      query GetKernels {
        listKernelSpecs {
          name
        }
      }
    `;
    const response = await query({ query: LIST_KERNELSPECS });
    expect(response).toMatchSnapshot();
  });
});

describe("Mutations", () => {
  let kernelId;
  it("launches a kernel", async () => {
    const { mutate } = createTestClient(createServer());
    const START_KERNEL = gql`
      mutation StartJupyterKernel {
        startKernel(name: "python3") {
          id
          status
        }
      }
    `;

    const response = await mutate({ mutation: START_KERNEL });

    // When the response has errors, they'll be an array
    // and it's easier to diagnose if we use an expect matcher here
    expect(response.errors).toBeUndefined();

    kernelId = response.data.startKernel.id;

    expect(response).toMatchSnapshot();
  });
  it("shuts down a kernel", async () => {
    const { mutate } = createTestClient(createServer());
    const SHUTDOWN_KERNEL = gql`
      mutation KillJupyterKernel($id: ID) {
        shutdownKernel(id: $id) {
          id
          status
        }
      }
    `;
    const response = await mutate({
      mutation: SHUTDOWN_KERNEL,
      variables: { id: kernelId }
    });

    // When the response has errors, they'll be an array
    // and it's easier to diagnose if we use an expect matcher here
    expect(response.errors).toBeUndefined();

    expect(response).toMatchSnapshot();
  });
});
