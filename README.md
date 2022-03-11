# k8s-tag
Tag function allowing interaction with the kubernetes node client through yaml configs.

# Dependencies
- [Kubernetes javascript client](https://github.com/kubernetes-client/javascript) v0.15
- Tested on Node v16.13.1

# Usage
The goal of this project is to abstract out the complexity of the [Kubernetes javascript client](https://github.com/kubernetes-client/javascript). Readability is improved by automating construction of K8s client objects that are hard
to mentally map to the equivalent yaml configuration. Instead, a yaml configuration is applied using the k8s tag which
is easy to understand, familiar and ubiquitous online.

```javascript

const options = {
    name: 'job-1',
    namespace: 'default',
    schedule: '* * * * *',
    image: 'busybox',
    command: ['ls'],
    args: ['-l']
};

const job = k8s`
    apiVersion: "batch/v1"
    kind: "Job"
    metadata:
        name: "${options.name}"
        namespace: "${options.namespace || "default"}"
    spec:
        template:
            spec:
                containers:
                    - name: "${process.env.HELM_RELEASE_NAME}-data-collector"
                        image: "${options.image}"
                        command: "${options.command}"
                        args: ${options.args}
                        envFrom:
                        - secretRef:
                            name: "${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret"
                        ${ process.env.PREDECOS_KAFKA_SECRET ? `
                        - secretRef:
                            name: "${process.env.PREDECOS_KAFKA_SECRET}"
                        ` : ``}
                serviceAccountName: "${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account"
                restartPolicy: "Never"
                imagePullSecrets:
                    - name: "docker-secret"
`;

// Create the job on the cluster.
await job.create();

// Delete the job on the cluster.
await job.delete();

```

This system is undergoing active development and has a ways to go. However, I intend to add support for as many
kinds and apis as I can. Please create an issue if you test the current capabilities and an issue arises.