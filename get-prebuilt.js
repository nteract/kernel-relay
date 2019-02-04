/**
 * This module exists entirely to assist with getting the right
 * version of zeromq for the target platform on postinstall.
 *
 * To ease this setup, we'll keep this as a plain js file.
 */

const path = require("path");
const fs = require("fs");

const placementDir = path.join("lib", "build", "Release");
fs.mkdirSync(placementDir, { recursive: true });
const placement = path.join(placementDir, "zmq.node");

const zmqDir = path.dirname(require.resolve("zeromq"));
const builtModule = path.join(zmqDir, "build", "Release", "zmq.node");

fs.copyFileSync(builtModule, placement);
