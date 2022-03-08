
import chai from 'chai';
const expect = chai.expect;

import fs from 'fs'

import {k8s} from '../src/k8s-tag.mjs';

describe('k8s-tag', () => {

    it('should correctly map kind cron job to a k8s client object', async () => {

        process.env.HELM_RELEASE_NAME = 'newrelease'

        const options = {
            name: 'cronjob-1',
            namespace: 'default',
            schedule: '* * * * *',
            image: 'busybox:latest',
            command: 'ls',
            args: ['-l']
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

        expect(cronjob.toString()).to.equal(`
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
        `);
    })

})