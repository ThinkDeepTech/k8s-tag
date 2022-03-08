import { stringify } from "yaml";
import k8s from "@kubernetes/client-node";

class K8sObject {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${stringify(parsedYaml)}`);
;
        this._obj = this._k8sClientObject(parsedYaml.kind, parsedYaml);
    }

    metadata() {
        return this._obj.metadata;
    }

    k8sClientObject() {
        return this._obj;
    }

    _value(key, value) {
        if (typeof value !== 'object' && !Array.isArray(value)) {
            return value;
        } else {
            return this._k8sClientObject(key, value);
        }
    }

    _k8sClientObject(key, obj) {

        switch(key.toLowerCase()) {
            case 'cronjob': {

                console.log(`Creating cron job`);
                const subject = new k8s.V1CronJob();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['spec']);

                subject.spec = this._value('cronjob:spec', obj['spec']);

                return subject;
            }
            case 'cronjob:spec': {

                console.log(`Creating cron job spec`);
                const subject = new k8s.V1CronJobSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['jobTemplate']);

                subject.jobTemplate = this._value('job:template', obj['jobTemplate']);

                return subject;
            }
            case 'metadata': {

                console.log(`Creating metadata`);
                const subject = new k8s.V1ObjectMeta();

                for (const field in obj) {
                    subject[field] = this._value(field, obj[field]);
                }

                return subject;
            }
            case 'job:template': {

                console.log(`Creating job template`);
                const subject = new k8s.V1JobTemplateSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['spec']);

                subject.spec = this._value('job:spec', obj['spec']);

                return subject;
            }
            case 'job:spec': {

                console.log(`Creating job spec`);
                const subject = new k8s.V1JobSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['template']);

                subject.template = this._value('pod:template', obj['template']);

                return subject;
            }
            case 'pod:template': {

                console.log(`Creating pod template`);
                const subject = new k8s.V1PodTemplateSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                }, ['spec']);

                subject.spec = this._value('pod:spec', obj['spec']);

                return subject;
            }
            case 'pod:spec': {

                console.log(`Creating pod spec`);
                const subject = new k8s.V1PodSpec();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                });

                return subject;
            }
            case 'containers': {

                console.log(`Creating containers`);
                let vals = [];
                for (const entry of obj) {
                    vals.push(this._k8sClientObject('container', entry));
                }

                return vals
            }
            case 'container': {

                console.log(`Creating container`);
                const subject = new k8s.V1Container();

                this._runTransform(obj, (field, obj) => {
                    subject[field] = this._value(field, obj[field]);
                });

                return subject;
            }
            case 'envfrom': {

                console.log(`Creating envFrom`);
                let vals = [];
                for (const entry of obj) {
                    const type = Object.keys(entry)[0];
                    vals.push(this._k8sClientObject(type, entry[type]));
                }

                return vals;
            }
            case 'secretref': {

                console.log(`Creating secretref`);
                const subject = new k8s.V1EnvFromSource();
                const secretRef = new k8s.V1SecretEnvSource();

                this._runTransform(obj, (field, obj) => {
                    secretRef[field] = this._value(field, obj[field]);
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

                console.log(`Running transform on field ${field} for object ${JSON.stringify(obj)}`);
                transform(field, obj);
            }
        }
    }
}

export { K8sObject };