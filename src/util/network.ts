import { networkInterfaces } from "os";

// Get IPv4 network addresses (non-internal)
export function address() {
  const nets = networkInterfaces();
  const results = Object.create(null);

  for (const name of Object.keys(nets)) {
    if (nets[name] === undefined) return "localhost";
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) results[name] = [];
        results[name].push(net.address);
      }
    }
  }
  return Object.values(results)[0];
}
