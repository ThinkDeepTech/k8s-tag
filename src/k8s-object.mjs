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

    _value(fieldValue) {
        if (typeof fieldValue !== 'object' && !Array.isArray(fieldValue)) {
            return fieldValue;
        } else if (Array.isArray(fieldValue)) {
            // TODO:
        } else {
            return this._k8sClientObject(fieldValue);
        }
    }

    _k8sClientObject(obj) {

        // TODO: This can't be done here if it's the recursive fcn. Create top-level case.
        const k8sKind = obj.kind.toLowerCase();
        switch(k8sKind) {
            case 'cronjob': {

                const subject = new k8s.V1CronJob();
                const spec = new k8s.V1CronJobSpec();

                // TODO: Abstract out into functions for spec and subject and change in all other places.
                for (const field in parsedYaml) {
                    if (field === 'spec') continue;

                    subject[field] = this._value(parsedYaml[field]);
                }

                for (const field in parsedYaml['spec']) {
                    spec[field] = this._value(parsedYaml['spec'][field]);
                }

                subject.spec = spec;

                return subject;
            }
            case 'metadata': {

                const subject = new k8s.V1ObjectMeta();

                for (const field in parsedYaml) {
                    subject[field] = this._value(parsedYaml[field]);
                }

                return subject;
            }
            case 'jobtemplate': {

                const subject = new k8s.V1JobTemplateSpec();
                const jobSpec = new k8s.V1JobSpec();
                const podTemplateSpec = new k8s.V1PodTemplateSpec();
                const podSpec = new k8s.V1PodSpec();

                for (const field in obj) {
                    if (field === 'spec') continue;

                    subject[field] = this._value(parsedYaml[field]);
                }

                for (const field in parsedYaml['spec']) {
                    spec[field] = this._value(parsedYaml['spec'][field]);
                }

                podTemplateSpec.spec = podSpec;
                jobSpec.template = podTemplateSpec;
                subject.spec = jobSpec;

                return subject;
            }
            case 'pod': {


                const podSpec = new k8s.V1PodSpec();

                for (const field in obj) {
                    if (field === 'spec') continue;

                    subject[field] = this._value(parsedYaml[field]);
                }

                for (const field in parsedYaml['spec']) {
                    spec[field] = this._value(parsedYaml['spec'][field]);
                }

                podTemplateSpec.spec = podSpec;
                jobSpec.template = podTemplateSpec;
                subject.spec = jobSpec;

                return subject;
            }
        }
    }

    _constructObject(parsedYaml) {        ;
        return this._k8sClientObject(parsedYaml);
    }
}

export { K8sObject };