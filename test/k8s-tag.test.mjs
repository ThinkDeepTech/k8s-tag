
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

        const actual = cronjob._manifest._obj._obj;

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

    it('should correctly map kind job to a k8s client object', () => {
        process.env.HELM_RELEASE_NAME = 'newrelease'
        process.env.PREDECOS_KAFKA_SECRET = 'kafka-secret'

        const options = {
            name: 'cronjob-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: ['node'],
            args: ['something', 'else']
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

        const actual = job._manifest._obj._obj;

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

        const actual = subject._manifest._obj._obj;

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

        const subject = k8s`
            apiVersion: v1
            kind: Pod
            metadata:
                name: private-reg
            spec:
                containers:
                    - name: private-reg-container
                      image: <your-private-image>
                imagePullSecrets:
                    - name: regcred
        `;

        const actual = subject._manifest._obj._obj;

        expect(actual.constructor.name).to.include('Pod');
        expect(actual.apiVersion).to.equal('v1');
        expect(actual.kind).to.equal('Pod');
    })

})