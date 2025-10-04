export function authConfigToGraphDynamic(authConfig: any) {
  const nodes: any[] = [];
  const edges: any[] = [];
  let id = 1;

  // 1️⃣ Auth Starter
  nodes.push({
    id: String(id),
    type: "authStarter",
    position: { x: 0, y: 0 },
    data: { label: "Auth Starter" },
  });
  const authStarterId = id;
  id++;

  // 2️⃣ Prisma Database
  if (authConfig.database) {
    nodes.push({
      id: String(id),
      type: "prismaDatabase",
      position: { x: 200, y: 150 },
      data: {
        label: "Prisma Database",
        provider: authConfig.database.provider,
      },
    });
    edges.push({
      id: `e${id}-${authStarterId}`,
      source: String(id),
      target: String(authStarterId),
      animated: true,
    });
    id++;
  }

  // 3️⃣ Social Providers
  const socialProviders = authConfig.socialProviders
    ? Object.keys(authConfig.socialProviders)
    : [];
  socialProviders.forEach((provider, index) => {
    const type = `oauth${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
    const positionX = 400 + index * 200; // dynamically spread horizontally
    const positionY = 300;
    nodes.push({
      id: String(id),
      type,
      position: { x: positionX, y: positionY },
      data: {
        label: `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth`,
      },
    });
    edges.push({
      id: `e${id}-${authStarterId}`,
      source: String(id),
      target: String(authStarterId),
      animated: true,
    });
    id++;
  });

  // 4️⃣ Email Resend Node
  if (authConfig.emailAndPassword?.enabled) {
    const positionX = 400 + socialProviders.length * 200; // place after last social provider
    nodes.push({
      id: String(id),
      type: "emailResend",
      position: { x: positionX, y: 300 },
      data: { label: "Resend Email Provider" },
    });
    edges.push({
      id: `e${id}-${authStarterId}`,
      source: String(id),
      target: String(authStarterId),
      animated: true,
    });
    id++;
  }

  // 5️⃣ Event Handler Node
  const lastX = nodes[nodes.length - 1].position.x;
  nodes.push({
    id: String(id),
    type: "eventHandler",
    position: { x: lastX + 200, y: 450 }, // position after last node
    data: { label: "onLoginSuccess" },
  });
  edges.push({
    id: `e${id}-${authStarterId}`,
    source: String(id),
    target: String(authStarterId),
    animated: false,
  });

  return { nodes, edges };
}
