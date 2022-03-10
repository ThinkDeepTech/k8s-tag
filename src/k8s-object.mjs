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

        console.log(`Processing key: ${key}`);

        if (!value) return value;

        if ((typeof value !== 'object') && !(Array.isArray(value)) && !key.includes('array'))
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
            case 'service': {
                const subject = new k8s.V1Service();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('service:spec', value['spec']);

                return subject;
            }
            case 'deployment': {
                const subject = new k8s.V1Deployment();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['spec', 'status']);

                subject.spec = this._k8sClientObject('deployment:spec', value['spec']);
                subject.status = this._k8sClientObject('deployment:status', value['status']);

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

                let subject = {};

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
            case 'service:spec': {
                const subject = new k8s.V1ServiceSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['ports']);

                subject['ports'] = this._k8sClientObject('service:ports', value['ports']);

                return subject;
            }
            case 'deployment:spec': {
                const subject = new k8s.V1DeploymentSpec();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['selector', 'template', 'strategy']);

                subject['selector'] = this._k8sClientObject('label:selector', value['selector']);
                subject['strategy'] = this._k8sClientObject('deployment:strategy', value['strategy']);
                subject['template'] = this._k8sClientObject('pod:template', value['template']);

                return subject;
            }
            case 'deployment:status': {
                const subject = new k8s.V1DeploymentStatus();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['conditions']);

                subject.conditions = this._k8sClientObject('deployment:conditions', value['conditions'])

                return subject;
            }
            case 'deployment:conditions': {
                let vars = [];

                for (const entry of value) {
                    vars.push(this._k8sClientObject('deployment:condition', entry));
                }

                return vars;
            }
            case 'deployment:condition': {

                const subject = new k8s.V1DeploymentCondition();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'deployment:strategy': {
                const subject = new k8s.V1DeploymentStrategy();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['rollingUpdate']);

                subject['rollingUpdate'] = this._k8sClientObject('deployment:rolling:update', value['rollingUpdate']);

                return subject;
            }
            case 'deployment:rolling:update': {
                const subject = new k8s.V1RollingUpdateDeployment();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'label:selector': {
                const subject = new k8s.V1LabelSelector();

                subject['matchExpressions'] = this._k8sClientObject('label:selector:requirement', value['matchExpressions']);
                subject['matchLabels'] = this._k8sClientObject('type:map', value['matchLabels']);

                return subject;
            }
            case 'label:selector:requirement': {

                const subject = new k8s.V1LabelSelectorRequirement();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['values']);

                subject['values'] = this._k8sClientObject('type:array', values['values']);

                return subject;
            }
            case 'service:ports': {
                let vals = [];

                for (const field in value) {
                    vals.push(this._k8sClientObject('service:port', value[field]));
                }

                return vals;
            }
            case 'service:port': {
                const subject = new k8s.V1ServicePort();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'creationtimestamp': {

            }
            case 'metadata': {

                const subject = new k8s.V1ObjectMeta();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }, ['labels', 'finalizers', 'managedFields']);

                subject.labels = this._k8sClientObject('type:map', value['labels']);
                subject.finalizers = this._k8sClientObject('type:array', value['finalizers']);
                subject.managedFields = this._k8sClientObject('metadata:managed:fields', value['managedFields']);

                return subject;
            }
            case 'metadata:managed:fields': {
                let vars = [];

                for (const entry of value) {
                    vars.push(this._k8sClientObject('metadata:managed:field', entry));
                }

                return vars;
            }
            case 'metadata:managed:field': {
                const subject = new k8s.V1ManagedFieldsEntry();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'selector': {
                let subject = {};

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
                }, ['command', 'args', 'ports', 'livenessProbe', 'readinessProbe', 'startupProbe']);

                subject['startupProbe'] = this._k8sClientObject('probe', value['startupProbe']);
                subject['readinessProbe'] = this._k8sClientObject('probe', value['readinessProbe']);
                subject['livenessProbe'] = this._k8sClientObject('probe', value['livenessProbe']);
                subject['ports'] = this._k8sClientObject('container:port', value['ports']);
                subject['command'] = this._k8sClientObject('type:array', value['command']);
                subject['args'] = this._k8sClientObject('type:array', value['args']);

                return subject;
            }
            case 'volumemounts': {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('volumemount', entry));
                }

                return vals;
            }
            case 'volumemount': {
                const subject = new k8s.V1VolumeMount();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'volumedevices': {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('volumedevice', entry));
                }

                return vals;
            }
            case 'volumedevice': {
                const subject = new k8s.V1VolumeDevice();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'securitycontext': {
                const subject = new k8s.V1SecurityContext();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'windowsoptions': {
                const subject = new k8s.V1WindowsSecurityContextOptions();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'seccompprofile': {
                const subject = new k8s.V1SeccompProfile();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'selinuxoptions': {
                const subject = new k8s.V1SELinuxOptions();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'capabilities': {
                const subject = new k8s.V1Capabilities();

                subject.add = this._k8sClientObject('type:array', value['add']);
                subject.drop = this._k8sClientObject('type:array', value['drop']);

                return subject;
            }
            case 'resources': {
                const subject = new k8s.V1ResourceRequirements();

                subject.limits = this._k8sClientObject('type:map', value['limits']);
                subject.requests = this._k8sClientObject('type:map', value['requests']);

                return subject;
            }
            case 'probe': {
                const subject = new k8s.V1Probe();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'lifecycle': {
                const subject = new k8s.V1Lifecycle();

                subject['postStart'] = this._k8sClientObject('handler', value['postStart']);
                subject['preStop'] = this._k8sClientObject('handler', value['preStop']);

                return subject;
            }
            case 'handler': {
                const subject = new k8s.V1Handler();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'tcpsocket': {
                const subject = new k8s.V1TCPSocketAction();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'httpget': {
                const subject = new k8s.V1HTTPGetAction();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'httpheaders': {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('httpheader', entry));
                }

                return vals;
            }
            case 'httpheader': {
                const subject = new k8s.V1HTTPHeader();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'exec': {
                const subject = new k8s.V1ExecAction();

                subject.command = this._k8sClientObject('type:array', value['command']);

                return subject;
            }
            case 'env': {
                const subject = new k8s.V1EnvVar();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'valuefrom': {
                const subject = new k8s.V1EnvVarSource();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'secretkeyref': {
                const subject = new k8s.V1SecretKeySelector();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'resourcefieldref': {
                const subject = new k8s.V1ResourceFieldSelector();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'fieldref': {
                const subject = new k8s.V1ObjectFieldSelector();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'configmapkeyref': {
                const subject = new k8s.V1ConfigMapKeySelector();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'container:ports': {
                let vars = [];

                for (const entry of value) {
                    vars.push(this._k8sClientObject('container:port', entry));
                }

                return vars;
            }
            case 'container:port': {
                const subject = new k8s.V1ContainerPort();

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

                return subject;
            }
            case 'type:map': {
                let subject = {};

                this._runTransform(value, (field, value) => {
                    subject[field] = this._k8sClientObject(field, value[field]);
                });

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
            case 'configmapref': {

                const subject = new k8s.V1EnvFromSource();
                const configMap = new k8s.V1ConfigMapEnvSource();

                this._runTransform(value, (field, value) => {
                    configMap[field] = this._k8sClientObject(field, value[field]);
                });

                subject.configMapRef = configMap;

                return subject;
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