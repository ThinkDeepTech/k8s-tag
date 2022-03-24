# k8s-tag
Tag function allowing interaction with the kubernetes node client through yaml configs.

# Dependencies
- [Kubernetes javascript client](https://github.com/kubernetes-client/javascript) v0.15
- Tested on Node v16.13.1

# Usage
The goal of this project is to abstract out the complexity of the [Kubernetes javascript client](https://github.com/kubernetes-client/javascript). Readability is improved by automating construction of K8s client objects that are hard
to mentally map to the equivalent yaml configuration. Instead, the k8s tag is used with a yaml configuration which
makes it easier to understand, familiar and examples of yaml configurations are ubiquitous online.

```javascript

import {k8s} from '@thinkdeep/k8s-tag';

const options = {
    name: 'job-1',
    namespace: 'default',
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
                      command: ${options.command}
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