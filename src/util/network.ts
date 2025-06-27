import { networkInterfaces } from "os";

// Get IPv4 network addresses (non-internal)
export function address() {
  const nets = networkInterfaces();
  const virtualInterfacePrefixes = [
    "tailscale",
    "ts", // Common Tailscale alias
    "docker",
    "br-", // Bridge interfaces
    "veth", // Virtual Ethernet interfaces
    "utun", // macOS VPN/virtual interfaces (often Tailscale)
    "ppp", // Point-to-Point Protocol (modems, some VPNs)
    "tun", // Tunnel interfaces
    "tap", // Tap interfaces
    "wsl", // WSL specific interfaces
  ];

  let foundAddress: string | undefined;

  for (const name of Object.keys(nets)) {
    const netInterfaces = nets[name];
    if (netInterfaces === undefined) continue;

    const isVirtual = virtualInterfacePrefixes.some((prefix) =>
      name.startsWith(prefix),
    );

    for (const net of netInterfaces) {
      // Skip over non-IPv4, internal (i.e. 127.0.0.1), and virtual addresses
      if (net.family === "IPv4" && !net.internal && !isVirtual) {
        foundAddress = net.address;
        break;
      }
    }
    if (foundAddress) {
      break;
    }
  }

  // Return the found address or default to localhost
  return foundAddress || "localhost";
}
