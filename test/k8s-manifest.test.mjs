import chai from 'chai';
const expect = chai.expect;
const assert = chai.assert;

import {K8sManifest} from '../src/k8s-manifest.mjs';

describe('k8s-manifest', () => {

    describe('container mapping', () => {
        let parsedYaml;
        beforeEach(() => {
            parsedYaml = {
                apiVersion: 'v1',
                kind: 'Pod',
                metadata: {
                    name: 'sample-pod'
                },
                spec: {
                    containers: [{
                        name: 'container-name',
                        image: 'nginx',
                        command: ['/bin/bash'],
                        args: ['-c', 'echo "Hello"'],
                        envFrom: [{
                            configMapRef: {
                                name: 'config-map'
                            }
                        },{
                            secretRef: {
                                name: 'secret-name'
                            }
                        }],
                        resources: {
                            requests: {
                                memory: "64Mi",
                                cpu: "250m"
                            },
                            limits: {
                                memory: "128Mi",
                                cpu: "500m"
                            }
                        },
                        ports: [{
                            name: "liveness-port",
                            containerPort: 8080,
                            hostPort: 8080
                        }],
                        livenessProbe: {
                            httpGet: {
                                path: '/healthz',
                                port: 'liveness-port'
                            },
                            failureThreshold: 1,
                            periodSeconds: 10
                        },
                        startupProbe: {
                            httpGet: {
                                path: '/healthz',
                                port: 80
                            },
                            failureThreshold: 30,
                            periodSeconds: 10
                        }
                    }]
                }
            };
        });

        it('should create a container array of k8s client containers', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers)).to.equal(true);
            expect(subject.spec.containers[0].constructor.name).to.include('Container');
        })

        it('should correctly map name', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.containers[0].name).to.include('container-name');
        })

        it('should correctly map image', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.containers[0].image).to.include('nginx');
        })

        it('should correctly map startup probe', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers)).to.equal(true);
            expect(subject.spec.containers[0].startupProbe.constructor.name).to.include('Probe');
            expect(subject.spec.containers[0].startupProbe.failureThreshold).to.equal(30);
            expect(subject.spec.containers[0].startupProbe.periodSeconds).to.equal(10);
        })

        it('should correctly map liveness probe', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers)).to.equal(true);
            expect(subject.spec.containers[0].livenessProbe.constructor.name).to.include('Probe');
            expect(subject.spec.containers[0].livenessProbe.failureThreshold).to.equal(1);
            expect(subject.spec.containers[0].livenessProbe.periodSeconds).to.equal(10);
        })

        it('should correctly map http action', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers)).to.equal(true);
            expect(subject.spec.containers[0].startupProbe.httpGet.constructor.name).to.include('HTTPGetAction');
            expect(subject.spec.containers[0].startupProbe.httpGet.path).to.equal('/healthz');
            expect(subject.spec.containers[0].startupProbe.httpGet.port).to.equal(80);
            expect(subject.spec.containers[0].livenessProbe.httpGet.port).to.equal('liveness-port');
        })

        it('should correctly map ports', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers[0].ports)).to.equal(true);
            expect(subject.spec.containers[0].ports[0].name).to.equal('liveness-port');
            expect(subject.spec.containers[0].ports[0].containerPort).to.equal(8080);
            expect(subject.spec.containers[0].ports[0].hostPort).to.equal(8080);
        })

        it('should correctly map resources', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.containers[0].resources.constructor.name).to.include('ResourceRequirements');
            expect(subject.spec.containers[0].resources.requests.memory).to.equal('64Mi');
            expect(subject.spec.containers[0].resources.requests.cpu).to.equal('250m');
            expect(subject.spec.containers[0].resources.limits.memory).to.equal('128Mi');
            expect(subject.spec.containers[0].resources.limits.cpu).to.equal('500m');
        })

        it('should correctly map command', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers[0].command)).to.equal(true);
            expect(subject.spec.containers[0].command[0]).to.equal('/bin/bash');
        })

        it('should correctly map args', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers[0].args)).to.equal(true);
            expect(subject.spec.containers[0].args[0]).to.equal('-c');
            expect(subject.spec.containers[0].args[1]).to.equal('echo "Hello"');
        })

        it('should correctly map envFrom', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers[0].envFrom)).to.equal(true);

            const envFrom = subject.spec.containers[0].envFrom;

            const configMapKey = Object.keys(envFrom[0])[0];
            const secretRefKey = Object.keys(envFrom[1])[0];
            expect(configMapKey).to.equal('configMapRef');
            expect(envFrom[0].constructor.name).to.include('EnvFromSource');
            expect(envFrom[0][configMapKey].constructor.name).to.include('ConfigMapEnvSource');
            expect(envFrom[0][configMapKey].name).to.equal('config-map');

            expect(secretRefKey).to.equal('secretRef');
            expect(envFrom[1].constructor.name).to.include('EnvFromSource');
            expect(envFrom[1][secretRefKey].constructor.name).to.include('SecretEnvSource');
            expect(envFrom[1][secretRefKey].name).to.equal('secret-name');
        })
    })

    describe('pod mapping', () => {
        let parsedYaml;
        beforeEach(() => {
            parsedYaml = {
                apiVersion: 'v1',
                kind: 'Pod',
                metadata: {
                    name: 'sample-pod'
                },
                spec: {
                    containers: [{
                        name: 'container-name',
                        image: 'nginx'
                    }],
                    dnsPolicy: "ClusterFirst",
                    imagePullSecrets: [{
                        name: "docker-secret"
                    }],
                    restartPolicy: "Never",
                    schedulerName: "default-scheduler",
                    securityContext: {},
                    serviceAccount: "service-account",
                    serviceAccountName: "service-account-name",
                    terminationGracePeriodSeconds: 30
                }
            };
        });

        it('should create a k8s client pod', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.constructor.name).to.include('Pod');
            expect(subject.apiVersion).to.equal('v1');
            expect(subject.kind).to.equal('Pod');
        })

        it('should create a k8s client pod spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.constructor.name).to.include('PodSpec');
        })

        it('should create a container array of k8s client containers', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.containers)).to.equal(true);
            expect(subject.spec.containers[0].constructor.name).to.include('Container');
        })

        it('should set the termination grace period', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.terminationGracePeriodSeconds).to.equal(30);
        })

        it('should set the scheduler name', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.serviceAccountName).to.equal('service-account-name');
        })


        it('should set the serviceAccount', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.serviceAccount).to.equal('service-account');
        })

        it('should set the security context', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.securityContext.constructor.name).to.include('SecurityContext');
        })

        it('should set the scheduler name', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.schedulerName).to.equal('default-scheduler');
        })

        it('should set the restart policy', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.restartPolicy).to.equal('Never');
        })

        it('should set the dnsPolicy', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.dnsPolicy).to.equal('ClusterFirst');
        })

        it('should set the image pull secrets', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.imagePullSecrets)).to.equal(true)
            expect(subject.spec.imagePullSecrets[0].constructor.name).to.include('LocalObjectReference');
            expect(subject.spec.imagePullSecrets[0].name).to.equal('docker-secret');
        })
    })

    describe('job mapping', () => {
        let parsedYaml;
        beforeEach(() => {
            parsedYaml = {
                apiVersion: 'batch/v1',
                kind: 'Job',
                metadata: {
                    name: 'job'
                },
                spec: {
                    backoffLimit: 6,
                    completions: 1,
                    parallelism: 1,
                    selector: {
                        matchLabels: {
                            "controller-uid": "50453798-481c-4381-8561-8bacf22b9444"
                        },
                        matchExpressions: [{
                            key: 'tier',
                            operator: 'In',
                            values: ['cache']
                        }]
                    },
                    template: {
                        metadata: {
                            labels: {
                                "controller-uid": "50453798-481c-4381-8561-8bacf22b9444",
                                "job-name": "fetch-tweets-apple-business"
                            },
                            creationTimestamp: null
                        },
                        spec: {
                            containers: [{
                                name: 'container-name',
                                image: 'nginx'
                            }]
                        }
                    }
                }
            };
        });

        it('should create a k8s client job', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.constructor.name).to.include('Job');
            expect(subject.apiVersion).to.equal('batch/v1');
            expect(subject.kind).to.equal('Job');
        })

        it('should create a job spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.constructor.name).to.include('JobSpec');
        })

        it('should correctly map pod template', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.template.constructor.name).to.include('PodTemplateSpec');
        })

        it('should correctly map pod template metadata', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.template.metadata.constructor.name).to.include('ObjectMeta');
            expect(subject.spec.template.metadata.labels['controller-uid']).to.equal('50453798-481c-4381-8561-8bacf22b9444');
            expect(subject.spec.template.metadata.labels['job-name']).to.equal('fetch-tweets-apple-business');

        })

        it('should correctly set selector match expressions', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(Array.isArray(subject.spec.selector.matchExpressions)).to.equal(true);
            expect(subject.spec.selector.matchExpressions[0].constructor.name).to.include('LabelSelectorRequirement');

            const firstExpression = subject.spec.selector.matchExpressions[0];
            expect(firstExpression.key).to.equal('tier');
            expect(firstExpression.operator).to.equal('In');
            expect(Array.isArray(firstExpression.values)).to.equal(true);
            expect(firstExpression.values[0]).to.equal('cache');

        })

        it('should correctly set selector match labels', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.selector.matchLabels['controller-uid']).to.equal("50453798-481c-4381-8561-8bacf22b9444");
        })

        it('should correctly set selector', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.selector.constructor.name).to.include('LabelSelector');
        })

        it('should correctly set parallelism', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.parallelism).to.equal(1);
        })

        it('should correctly set completions', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.completions).to.equal(1);
        })

        it('should correctly set backoff limit', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.backoffLimit).to.equal(6);
        })
    })

    describe('cron job mapping', () => {

        let parsedYaml;
        beforeEach(() => {
            parsedYaml = {
                apiVersion: 'batch/v1',
                kind: 'CronJob',
                metadata: {
                    name: 'cron-job'
                },
                spec: {
                    jobTemplate: {
                        spec: {
                            template: {
                                spec: {
                                    containers: [{
                                        name: 'container-name',
                                        image: 'nginx'
                                    }]
                                }
                            }
                        }
                    }
                }
            };
        });

        it('should create a k8s client cron job', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.constructor.name).to.include('CronJob');
            expect(subject.apiVersion).to.equal('batch/v1');
            expect(subject.kind).to.equal('CronJob');
            expect(subject.spec.constructor.name).to.include('CronJobSpec');
        })

        it('should create a k8s client cron job spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.constructor.name).to.include('CronJobSpec');
        })

        it('should create a k8s client job template', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.jobTemplate.constructor.name).to.include('JobTemplateSpec');
        })

        it('should create a k8s client job spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.jobTemplate.spec.constructor.name).to.include('JobSpec');
        })

        it('should create a k8s client pod template spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.jobTemplate.spec.template.constructor.name).to.include('PodTemplateSpec');
        })

        it('should create a k8s client pod spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.jobTemplate.spec.template.spec.constructor.name).to.include('PodSpec');
        })

        it('should create a k8s client pod spec', () => {
            const manifest = new K8sManifest(parsedYaml);

            const subject = manifest.k8sClientObject();

            expect(subject.spec.jobTemplate.spec.template.spec.constructor.name).to.include('PodSpec');
        })

    })

})