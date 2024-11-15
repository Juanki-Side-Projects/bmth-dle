/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "bmth-dle",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          profile:
            input.stage === "production" ? "juanki-production" : "juanki-dev",
        },
      },
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("BMTHdle", { bastion: true });
    const cluster = new sst.aws.Cluster("BMTHdleCluster", { vpc });

    cluster.addService("BMTHdleService", {
      loadBalancer: {
        ports: [{ listen: "80/http", forward: "3000/http" }],
      },
      dev: {
        command: "npm run dev",
      },
    });
  },
});
