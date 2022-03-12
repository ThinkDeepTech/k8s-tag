
import chai from 'chai';
const expect = chai.expect;

import {k8s} from '../src/k8s-tag.mjs';

describe('k8s-tag', () => {

    it('should correctly map kind cron job to a k8s client object', () => {

        process.env.HELM_RELEASE_NAME = 'newrelease'
        process.env.PREDECOS_KAFKA_SECRET = 'kafka-secret'

        const options = {
            name: 'cronjob-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: 'ls',
            args: ['something', 'else']
        };

        const subject = k8s`
            apiVersion: "batch/v1"
            kind: "CronJob"
            metadata:
                name: "${options.name}"
                namespace: "${options.namespace || "default"}"
            spec:
                schedule: "${options.schedule}"
                jobTemplate:
                    spec:
                        template:
                            spec:
                                containers:
                                    - name: "${process.env.HELM_RELEASE_NAME}-data-collector"
                                      image: "${options.image}"
                                      command: ["${options.command}"]
                                      args:
                                        ${options.args.map((arg) => `
                                        - ${arg}`)}
                                      envFrom:
                                        - secretRef:
                                            name: "${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret"
                                        ${ process.env.PREDECOS_KAFKA_SECRET ? `
                                        - secretRef:
                                            name: "${process.env.PREDECOS_KAFKA_SECRET}"
                                        ` : ``}
                                serviceAccountName: "${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account"
                                restartPolicy: "Never"
        `;

        const actual = subject._manifest._obj;

        expect(actual.apiVersion).to.equal('batch/v1');
        expect(actual.kind).to.equal('CronJob');
        expect(actual.metadata.constructor.name).to.include('ObjectMeta');
        expect(actual.metadata.name).to.equal(options.name);
        expect(actual.metadata.namespace).to.equal(options.namespace);
        expect(actual.spec.schedule).to.equal(options.schedule);
    })

    it('should correctly handle array when passed directly into field', () => {

        process.env.HELM_RELEASE_NAME = 'newrelease'

        const options = {
            name: 'cronjob-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: 'ls',
            args: ['something', 'else']
        };

        const subject = k8s`
            apiVersion: "batch/v1"
            kind: "CronJob"
            metadata:
                name: "${options.name}"
                namespace: "${options.namespace || "default"}"
            spec:
                schedule: "${options.schedule}"
                jobTemplate:
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
        `;

        const actual = subject._manifest._obj;

        expect(Array.isArray(actual.spec.jobTemplate.spec.template.spec.containers[0].args)).to.equal(true);
        expect(actual.spec.jobTemplate.spec.template.spec.containers[0].args[0]).to.equal(options.args[0]);
        expect(actual.spec.jobTemplate.spec.template.spec.containers[0].args[1]).to.equal(options.args[1]);
    })

    it('should correctly handle an array when passed in using array.map', () => {

        process.env.HELM_RELEASE_NAME = 'newrelease'

        const options = {
            name: 'cronjob-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: 'ls',
            args: ['something', 'else']
        };

        const subject = k8s`
            apiVersion: "batch/v1"
            kind: "CronJob"
            metadata:
                name: "${options.name}"
                namespace: "${options.namespace || "default"}"
            spec:
                schedule: "${options.schedule}"
                jobTemplate:
                    spec:
                        template:
                            spec:
                                containers:
                                    - name: "${process.env.HELM_RELEASE_NAME}-data-collector"
                                      image: "${options.image}"
                                      command: "${options.command}"
                                      args:
                                        ${options.args.map((arg) => `
                                        - ${arg}`)}
                                      envFrom:
                                        - secretRef:
                                            name: "${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret"
                                        ${ process.env.PREDECOS_KAFKA_SECRET ? `
                                        - secretRef:
                                            name: "${process.env.PREDECOS_KAFKA_SECRET}"
                                        ` : ``}
                                serviceAccountName: "${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account"
                                restartPolicy: "Never"
        `;

        const actual = subject._manifest._obj;

        expect(Array.isArray(actual.spec.jobTemplate.spec.template.spec.containers[0].args)).to.equal(true);
        expect(actual.spec.jobTemplate.spec.template.spec.containers[0].args[0]).to.equal(options.args[0]);
        expect(actual.spec.jobTemplate.spec.template.spec.containers[0].args[1]).to.equal(options.args[1]);
    })

    it('should correctly map kind job to a k8s client object', () => {
        process.env.HELM_RELEASE_NAME = 'newrelease'
        process.env.PREDECOS_KAFKA_SECRET = 'kafka-secret'

        const options = {
            name: 'job-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: ['node'],
            args: ['something', 'else']
        };

        const subject = k8s`
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

        const actual = subject._manifest._obj;

        expect(actual.apiVersion).to.equal('batch/v1');
        expect(actual.kind).to.equal('Job');
        expect(actual.metadata.constructor.name).to.include('ObjectMeta');
        expect(actual.metadata.name).to.equal(options.name);
        expect(actual.metadata.namespace).to.equal(options.namespace);
        expect(actual.spec.constructor.name).to.include('JobSpec');
        expect(actual.spec.template.constructor.name).to.include('PodTemplateSpec');
        expect(actual.spec.template.spec.constructor.name).to.include('PodSpec');
        expect(Array.isArray(actual.spec.template.spec.containers)).to.equal(true);

        expect(Array.isArray(actual.spec.template.spec.imagePullSecrets)).to.equal(true);
        expect(actual.spec.template.spec.imagePullSecrets[0].constructor.name).to.include('LocalObjectReference');
        expect(actual.spec.template.spec.imagePullSecrets[0].name).to.equal('docker-secret');

        const container = actual.spec.template.spec.containers[0];
        expect(container.constructor.name).to.include('Container');
        expect(container.image).to.equal(options.image);
        expect(container.command[0]).to.equal(options.command[0]);
        expect(container.args[0]).to.equal(options.args[0]);
        expect(container.args[1]).to.equal(options.args[1]);
        expect(Array.isArray(container.envFrom)).to.equal(true);
        expect(container.envFrom[0].constructor.name).to.include('EnvFromSource');
        expect(container.envFrom[0].secretRef.constructor.name).to.include('SecretEnvSource');
        expect(container.envFrom[0].secretRef.name).to.equal(`${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret`);
        expect(container.envFrom[1].secretRef.constructor.name).to.include('SecretEnvSource');
        expect(container.envFrom[1].secretRef.name).to.equal(`${process.env.PREDECOS_KAFKA_SECRET}`);
    })

    it('should correctly map kind secret to a k8s client object', () => {

        const subject = k8s`
            apiVersion: v1
            kind: Secret
            metadata:
                name: secret-sa-sample
                annotations:
                    kubernetes.io/service-account.name: "sa-name"
            type: kubernetes.io/service-account-token
            data:
                extra: YmFyCg==
        `;

        const actual = subject._manifest._obj;

        expect(actual.constructor.name).to.include('Secret');
        expect(actual.apiVersion).to.equal('v1');
        expect(actual.kind).to.equal('Secret');
        expect(actual.metadata.constructor.name).to.include('ObjectMeta');
        expect(actual.metadata.name).to.equal('secret-sa-sample');
        expect(actual.metadata.annotations['kubernetes.io/service-account.name']).to.equal('sa-name');
        expect(actual.type).to.equal('kubernetes.io/service-account-token');
        expect(actual.data.extra).to.equal('YmFyCg==');
    })

    it('should correctly map kind pod to a k8s client object', () => {

        const options = {
            appLabel: 'some-application',
            configMap: 'some-configmap',
            secret: 'some-dynamic-secret-name'
        };

        const subject = k8s`
            apiVersion: v1
            kind: Pod
            metadata:
                name: private-reg
            spec:
                containers:
                    - envFrom:
                        - configMapRef:
                            name: ${options.configMap}
                        - secretRef:
                            name: ${options.secret}
                        - secretRef:
                            name: somesecret
                      image: "busybox:latest"
                      imagePullPolicy: Always
                      name: ${options.appLabel}
                      ports:
                      - containerPort: 4002
                        protocol: TCP
                      resources: {}
                      terminationMessagePath: /dev/termination-log
                      terminationMessagePolicy: File
                dnsPolicy: ClusterFirst
                imagePullSecrets:
                    - name: image-pull-secret
                restartPolicy: Always
                schedulerName: default-scheduler
                securityContext: {}
                serviceAccount: v1-collection-manager-service-account
                serviceAccountName: v1-collection-manager-service-account
                terminationGracePeriodSeconds: 30
        `;

        const actual = subject._manifest._obj;

        expect(actual.constructor.name).to.include('Pod');
        expect(actual.apiVersion).to.equal('v1');
        expect(actual.kind).to.equal('Pod');
    })

    it('should correctly map kind service to a k8s client object', () => {

        const subject = k8s`
        apiVersion: v1
        kind: Service
        metadata:
          annotations:
            meta.helm.sh/release-name: v1
            meta.helm.sh/release-namespace: development
          creationTimestamp: "2022-03-08T15:46:18Z"
          labels:
            app.kubernetes.io/managed-by: Helm
          name: v1-deep-microservice-collection-service
          namespace: development
          resourceVersion: "9930598"
          uid: 091a8fd6-23a4-4c64-815b-15eebc3853a9
        spec:
          clusterIP: 10.245.63.199
          clusterIPs:
          - 10.245.63.199
          ipFamilies:
          - IPv4
          ipFamilyPolicy: SingleStack
          ports:
          - port: 4002
            protocol: TCP
            targetPort: 4002
          selector:
            app: MyApp
          sessionAffinity: None
          type: ClusterIP
        status:
          loadBalancer: {}
        `;

        const actual = subject._manifest._obj;

        expect(actual.constructor.name).to.include('Service');
        expect(actual.apiVersion).to.equal('v1');
        expect(actual.kind).to.equal('Service');
        expect(actual.spec.constructor.name).to.include('ServiceSpec');
        expect(actual.spec.selector.app).to.equal('MyApp');
        expect(Array.isArray(actual.spec.ports)).to.equal(true);
        expect(actual.spec.ports[0].constructor.name).to.include('ServicePort');
        expect(actual.spec.ports[0].protocol).to.equal('TCP');
        expect(actual.spec.ports[0].port).to.equal(4002);
        expect(actual.spec.ports[0].targetPort).to.equal(4002);
    })

    it('should correctly map kind deployment to a k8s client object', () => {

        const options = {
            appLabel: 'some-application',
            configMap: 'some-configmap',
            secret: 'some-dynamic-secret-name'
        };

        const subject = k8s`
        apiVersion: apps/v1
        kind: Deployment
        metadata:
            annotations:
                deployment.kubernetes.io/revision: "1"
                meta.helm.sh/release-name: v1
                meta.helm.sh/release-namespace: development
            creationTimestamp: "2022-03-08T15:46:18Z"
            generation: 1
            labels:
                app: ${options.appLabel}-deployment
                app.kubernetes.io/managed-by: Helm
            name: ${options.appLabel}-deployment
            namespace: development
        spec:
            progressDeadlineSeconds: 600
            replicas: 1
            revisionHistoryLimit: 10
            selector:
                matchLabels:
                    app: ${options.appLabel}
            strategy:
                rollingUpdate:
                    maxSurge: 25%
                    maxUnavailable: 25%
                type: RollingUpdate
            template:
                metadata:
                    creationTimestamp: null
                    labels:
                        app: ${options.appLabel}
                spec:
                    containers:
                        - envFrom:
                            - configMapRef:
                                name: ${options.configMap}
                            - secretRef:
                                name: ${options.secret}
                            - secretRef:
                                name: somesecret
                          image: "busybox:latest"
                          imagePullPolicy: Always
                          name: ${options.appLabel}
                          ports:
                          - containerPort: 4002
                            protocol: TCP
                          resources: {}
                          terminationMessagePath: /dev/termination-log
                          terminationMessagePolicy: File
                    dnsPolicy: ClusterFirst
                    imagePullSecrets:
                        - name: image-pull-secret
                    restartPolicy: Always
                    schedulerName: default-scheduler
                    securityContext: {}
                    serviceAccount: v1-collection-manager-service-account
                    serviceAccountName: v1-collection-manager-service-account
                    terminationGracePeriodSeconds: 30
        status:
            availableReplicas: 1
            conditions:
                - lastTransitionTime: "2022-03-08T15:58:55Z"
                  lastUpdateTime: "2022-03-08T15:58:55Z"
                  message: ReplicaSet "v1-deep-microservice-collection-deployment-75855858f9" has successfully progressed.
                  reason: NewReplicaSetAvailable
                  status: "True"
                  type: Progressing
                - lastTransitionTime: "2022-03-10T15:28:11Z"
                  lastUpdateTime: "2022-03-10T15:28:11Z"
                  message: Deployment has minimum availability.
                  reason: MinimumReplicasAvailable
                  status: "True"
                  type: Available
            observedGeneration: 1
            readyReplicas: 1
            replicas: 1
            updatedReplicas: 1
        `;

        const actual = subject._manifest._obj;

        expect(actual.constructor.name).to.include('Deployment');
        expect(actual.spec.constructor.name).to.include('DeploymentSpec');
    })

    it('should correctly map kind namespace to a k8s client object', () => {

        const subject = k8s`
        apiVersion: v1
        kind: Namespace
        metadata:
          creationTimestamp: "2022-03-08T15:30:07Z"
          labels:
            kubernetes.io/metadata.name: development
          name: development
        spec:
          finalizers:
          - kubernetes
        status:
          phase: Active
        `;

        const actual = subject._manifest._obj;

        expect(actual.kind).to.equal('Namespace');
        expect(actual.constructor.name).to.include('Namespace');
        expect(actual.spec.constructor.name).to.include('NamespaceSpec');
        expect(actual.status.constructor.name).to.include('NamespaceStatus');
    })

    it('should correctly map kind configmap to a k8s client object', () => {
        const subject = k8s`
        apiVersion: v1
        kind: ConfigMap
        metadata:
          annotations:
            meta.helm.sh/release-name: v1
            meta.helm.sh/release-namespace: development
          creationTimestamp: "2022-03-08T15:46:18Z"
          labels:
            app.kubernetes.io/managed-by: Helm
          name: v1-deep-microservice-collection-config-map
          namespace: development
        data:
          GRAPHQL_PATH: /graphql
          GRAPHQL_PORT: "4002"
          HELM_RELEASE_NAME: v1
          NAMESPACE: development
          NODE_ENV: development
        `;

        const actual = subject._manifest._obj;

        expect(actual.kind).to.equal('ConfigMap');
        expect(actual.constructor.name).to.include('ConfigMap');
        expect(actual.data['GRAPHQL_PATH']).to.equal('/graphql');
        expect(actual.data['GRAPHQL_PORT']).to.equal('4002');
        expect(actual.data['HELM_RELEASE_NAME']).to.equal('v1');
        expect(actual.data['NAMESPACE']).to.equal('development');
        expect(actual.data['NODE_ENV']).to.equal('development');
    })

    it('should correctly map kind PersistentVolume to a k8s client object', () => {
        const subject = k8s`

        apiVersion: v1
        kind: PersistentVolume
        metadata:
          annotations:
            pv.kubernetes.io/provisioned-by: dobs.csi.digitalocean.com
          creationTimestamp: "2022-03-08T15:46:22Z"
          finalizers:
          - kubernetes.io/pv-protection
          - external-attacher/dobs-csi-digitalocean-com
          name: my-persistent-volume
        spec:
          accessModes:
          - ReadWriteOnce
          capacity:
            storage: 8Gi
          claimRef:
            apiVersion: v1
            kind: PersistentVolumeClaim
            name: v1-analysismongodb
            namespace: development
          csi:
            driver: dobs.csi.digitalocean.com
            fsType: ext4
            volumeAttributes:
              storage.kubernetes.io/csiProvisionerIdentity: 1643213782115-8081-dobs.csi.digitalocean.com
            volumeHandle: e72e4b60-9ef6-11ec-b54c-0a58ac14e15c
          persistentVolumeReclaimPolicy: Delete
          storageClassName: do-block-storage
          volumeMode: Filesystem
        status:
          phase: Bound

        `;

        const actual = subject._manifest._obj;

        console.log(subject.toString());
    })
})