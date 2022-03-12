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
                    }]
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

    it('should correctly map Job to a k8s client object', () => {

    })

    it('should correctly map Service to a k8s client object', () => {

    })

    it('should correctly map Deployment to a k8s client object', () => {

    })

    it('should correctly map Secret to a k8s client object', () => {

    })

    it('should correctly map ConfigMap to a k8s client object', () => {

    })

    it('should correctly map PersistentVolume to a k8s client object', () => {

    })

    describe('_k8sClientObject', () => {

        it('should throw an error if an unknown key is supplied', () => {


        })
    })
})