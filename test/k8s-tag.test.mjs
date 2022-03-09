
import chai from 'chai';
const expect = chai.expect;

import fs from 'fs'

import {k8s} from '../src/k8s-tag.mjs';

describe('k8s-tag', () => {

    it('should correctly map kind cron job to a k8s client object', () => {

        process.env.HELM_RELEASE_NAME = 'newrelease'

        const options = {
            name: 'cronjob-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: 'ls',
            args: ['something', 'else']
        };

        const cronjob = k8s`
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

        const actual = cronjob._manifest._obj._obj;

        expect(actual.apiVersion).to.equal('batch/v1');
        expect(actual.metadata.constructor.name).to.include('ObjectMeta');
        expect(actual.metadata.name).to.equal(options.name);
        expect(actual.metadata.namespace).to.equal(options.namespace);
        expect(actual.spec.schedule).to.equal(options.schedule);
        expect(Array.isArray(actual.spec.jobTemplate.spec.template.spec.containers)).to.equal(true);

        const container = actual.spec.jobTemplate.spec.template.spec.containers[0];
        expect(container.constructor.name).to.include('Container');
        expect(container.image).to.equal(options.image);
        expect(container.command).to.equal(options.command);
        expect(container.args[0]).to.equal(options.args[0]);
        expect(container.args[1]).to.equal(options.args[1]);
        expect(Array.isArray(container.envFrom)).to.equal(true);
        expect(container.envFrom[0].constructor.name).to.include('EnvFromSource');
        expect(container.envFrom[0].secretRef.constructor.name).to.include('SecretEnvSource');
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

        const cronjob = k8s`
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

        expect(Array.isArray(cronjob._manifest._obj._obj.spec.jobTemplate.spec.template.spec.containers[0].args)).to.equal(true);
        expect(cronjob._manifest._obj._obj.spec.jobTemplate.spec.template.spec.containers[0].args[0]).to.equal(options.args[0]);
        expect(cronjob._manifest._obj._obj.spec.jobTemplate.spec.template.spec.containers[0].args[1]).to.equal(options.args[1]);
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

        const cronjob = k8s`
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

        expect(Array.isArray(cronjob._manifest._obj._obj.spec.jobTemplate.spec.template.spec.containers[0].args)).to.equal(true);
        expect(cronjob._manifest._obj._obj.spec.jobTemplate.spec.template.spec.containers[0].args[0]).to.equal(options.args[0]);
        expect(cronjob._manifest._obj._obj.spec.jobTemplate.spec.template.spec.containers[0].args[1]).to.equal(options.args[1]);
    })

})