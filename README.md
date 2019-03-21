# @nteract/kernel-relay

This package provides a GraphQL API for managing communication between a
Jupyter kernel and front-end clients. The package allows users to control and
monitor kernels.

Through GraphQL queries and mutations, the API enables the user to launch
kernels, subscribe to the status of a kernel, send Jupyter messages from a
client to a kernel, and more.

## Installation

```
$ yarn add @nteract/kernel-relay
```

```
$ npm install --save @nteract/kernel-relay
```

## Developer Installation

To get started developing on `kernel-relay`, you'll need to clone this repository.

```
$ git clone https://github.com/nteract/kernel-relay.git
```

Then, you'll need to install the dependencies within this repository.

```
$ yarn
OR
$ npm install
```

You can then run the GraphQL server with a playground UI.

```
$ yarn start
```

## Docker Setup

To run an instance of the kernel-relay within a Docker container, you can execute the following commands. Note that you will need to have Docker installed on your machine.

First, run the following in the cloned directory to build a Docker image.

```
$ docker build -t nteract/kernel-relay-dev:latest .
```

Then, run a Docker container based on this image.

```
$ docker run  -p 4000:4000 -t nteract/kernel-relay-dev:latest
```

Next, navigate to http://localhost:4000 in your browser to interact with the instance of the kernel-relay running within your Docker container.

## Usage

The query example below showcases how to use the GraphQL API to get the status
of a kernel.

```
> query GetKernels {
  listKernelSpecs {
    name
  }
}

{
  "data": {
    "listKernelSpecs": [
      {
        "name": "python3"
      }
    ]
  }
}


> mutation StartJupyterKernel {
  startKernel(name: "python3") {
    id
    status
  }
}

{
  "data": {
    "startKernel": [
      {
        "name": "python3",
        "id": "a-uuid",
        "status": "started"
      }
    ]
  }
}
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by
watching this repository!

## Support

If you experience an issue while using this package or have a feature request,
please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose)
and, if possible, add the `pkg:kernel-relay` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
