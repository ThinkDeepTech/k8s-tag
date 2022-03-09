import yaml from "yaml";
import k8s from "@kubernetes/client-node";

class K8sObject {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${yaml.stringify(parsedYaml)}`);
;
        this._obj = this._k8sClientObject(parsedYaml.kind, parsedYaml);
    }

    metadata() {
        return this._obj.metadata;
    }

    toString() {
        return k8s.dumpYaml(this._obj);
    }

    k8sClientObject() {
        return this._obj;
    }

    _k8sClientObject(key, value) {

        if (typeof value === 'string' && !key.includes('array'))
            return value;

        switch(key.toLowerCase()) {
            case 'cronjob': {

                console.log(`Creating cron job`);
                const subject = new k8s.V1CronJob();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('cronjob:spec', value['spec']);

                return subject;
            }
            case 'job': {

                const subject = new k8s.V1Job();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('job:spec', value['spec']);

                return subject;
            }
            case 'pod': {
                const subject = new k8s.V1Pod();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('pod:spec', value['spec']);

                return subject;
            }
            case 'secret': {
                const subject = new k8s.V1Secret();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'data': {

                const subject = {};

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'cronjob:spec': {

                const subject = new k8s.V1CronJobSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['jobTemplate']);

                subject.jobTemplate = this._k8sClientObject('job:template', value['jobTemplate']);

                return subject;
            }
            case 'metadata': {

                const subject = new k8s.V1ObjectMeta();

                for (const field in value) {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }

                return subject;
            }
            case 'annotations': {

                let subject = {};

                for (const field in value) {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }

                return subject;
            }
            case 'job:template': {

                const subject = new k8s.V1JobTemplateSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('job:spec', value['spec']);

                return subject;
            }
            case 'job:spec': {

                const subject = new k8s.V1JobSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['template']);

                subject.template = this._k8sClientObject('pod:template', value['template']);

                return subject;
            }
            case 'pod:template': {

                const subject = new k8s.V1PodTemplateSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('pod:spec', value['spec']);

                return subject;
            }
            case 'pod:spec': {

                const subject = new k8s.V1PodSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'imagepullsecrets': {

                let vals = [];
                for (const obj of value) {
                    vals.push(this._k8sClientObject('localobjectreference', obj));
                }

                return vals;
            }
            case 'localobjectreference': {

                const subject = new k8s.V1LocalObjectReference();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'containers': {

                let vals = [];
                for (const entry of value) {
                    vals.push(this._k8sClientObject('container', entry));
                }

                return vals
            }
            case 'container': {

                const subject = new k8s.V1Container();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['command', 'args']);

                subject['command'] = this._k8sClientObject('type:array', value['command']);
                subject['args'] = this._k8sClientObject('type:array', value['args']);

                return subject;
            }
            case 'type:array': {
                let vals = []

                if ((typeof value === 'string')) {
                    vals = value.split(' ');
                } else {
                    vals = value;
                }

                return vals;
            }
            case 'envfrom': {

                let vals = [];
                for (const entry of value) {
                    const type = Object.keys(entry)[0];
                    vals.push(this._k8sClientObject(type, entry[type]));
                }

                return vals;
            }
            case 'secretref': {

                const subject = new k8s.V1EnvFromSource();
                const secretRef = new k8s.V1SecretEnvSource();

                this._runTransform(value, (field, value) => {
                    secretRef[field] = this._k8sClientObject(field, value[field]);
                });

                subject.secretRef = secretRef;

                return subject;
            }
            default: {
                throw new Error(`The specified key wasn't found: ${key}`);
            }
        }
    }

    _runTransform(value, transform, exclusions = []) {
        for (const field in value) {
            if (!exclusions.includes(field)) {

                transform(field, value);
            }
        }
    }
}

export { K8sObject };