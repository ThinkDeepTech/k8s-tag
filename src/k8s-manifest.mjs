import k8s from '@kubernetes/client-node';
import {stringify} from 'yaml';
import {K8sObject} from './k8s-object.mjs';

class K8sManifest {
    constructor(parsedYaml) {
        this._yaml = parsedYaml;
        this._obj = new K8sObject(parsedYaml);
    }

    kind() {
        return this._yaml.kind;
    }

    metadata() {
        return this._obj.metadata();
    }

    object() {
        // TODO
        return this._obj.toK8sClientObject();
    }

    toString() {
        return stringify(this._yaml);
    }
}

export { K8sManifest };