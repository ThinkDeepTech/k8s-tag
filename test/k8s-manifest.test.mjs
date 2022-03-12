import chai from 'chai';
const expect = chai.expect;
const assert = chai.assert;

import {K8sManifest} from '../src/k8s-manifest.mjs';

describe('k8s-manifest', () => {

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