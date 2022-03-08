import { stringify } from "yaml";
import k8s from "@kubernetes/client-node";

class K8sObject {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${stringify(parsedYaml)}`);

        this._obj = this._constructObject(parsedYaml);
    }

    // const cronjob = k8s`
    //         apiVersion: "batch/v1"
    //         kind: "CronJob"
    //         metadata:
    //             name: "${options.name}"
    //             namespace: "${options.namespace || "default"}"
    //         spec:
    //             schedule: "${options.schedule}"
    //             jobTemplate:
    //                 spec:
    //                     template:
    //                         spec:
    //                             containers:
    //                                 - name: "${process.env.HELM_RELEASE_NAME}-data-collector"
    //                                 image: "${options.image}"
    //                                 command: "${options.command}"
    //                                 args: ${options.args}
    //                                 envFrom:
    //                                     - secretRef:
    //                                         name: "${process.env.HELM_RELEASE_NAME}-deep-microservice-collection-secret"
    //                                     ${ process.env.PREDECOS_KAFKA_SECRET ? `
    //                                     - secretRef:
    //                                         name: "${process.env.PREDECOS_KAFKA_SECRET}"
    //                                     ` : ``}
    //                             serviceAccountName: "${process.env.HELM_RELEASE_NAME}-secret-accessor-service-account"
    //                             restartPolicy: "Never"
    //     `;

    _value(key, value) {
        if (typeof value !== 'object' && !Array.isArray(value)) {

            return value;

        } else if (Array.isArray(value)) {

            let singularKey = key;
            if (key.endsWith('s')) {
                singularKey = key.slice(0, key.length - 1);
            }

            let result = [];
            for (const obj of value) {
                result.push(this._k8sClientObject(singularKey, obj));
            }
            return result;

        } else {

            return this._k8sClientObject(key, value);
        }
    }

    _k8sClientObject(key, obj) {

        switch(key.toLowerCase()) {
            case 'cronjob': {

                const subject = new k8s.V1CronJob();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['spec']);

                subject.spec = this._value('cronjob:spec', obj['spec']);

                return subject;
            }
            case 'cronjob:spec': {

                const subject = new k8s.V1CronJobSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['jobTemplate']);

                subject.jobTemplate = this._value('job:template', obj['jobTemplate']);

                return subject;
            }
            case 'metadata': {

                const subject = new k8s.V1ObjectMeta();

                for (const field in obj) {
                    subject[field] = this._value(field, obj[field]);
                }

                return subject;
            }
            case 'job:template': {

                const subject = new k8s.V1JobTemplateSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['spec']);

                subject.spec = this._value('job:spec', obj['spec']);

                return subject;
            }
            case 'job:spec': {

                const subject = new k8s.V1JobSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['template']);

                subject.template = this._value('pod:template', obj['template']);

                return subject;
            }
            case 'pod:template': {

                const subject = new k8s.V1PodTemplateSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['spec']);

                subject.spec = this._value('pod:spec', obj['spec']);

                return subject;
            }
            case 'pod:spec': {

                const subject = new k8s.V1PodSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                });

                return subject;
            }
            case 'container': {

                const subject = new k8s.V1Container();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                });

                return subject;
            }
            case 'secretref': {

                const subject = new k8s.V1EnvFromSource();
                const secretRef = new k8s.V1SecretEnvSource();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                });

                subject.secretRef = secretRef;

                return subject;
            }
            default: {
                throw new Error(`The specified key wasn't found: ${key}`);
            }
        }
    }

    _runTransform(obj, transform, exclusions = []) {
        for (const field in obj) {
            if (!exclusions.includes(field)) {
                transform(field, obj);
            }
        }
    }

    _constructObject(parsedYaml) {        ;
        return this._k8sClientObject(parsedYaml.kind, parsedYaml);
    }
}

export { K8sObject };