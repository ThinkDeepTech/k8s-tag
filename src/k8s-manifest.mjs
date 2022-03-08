import yaml from 'yaml';
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
        return this._obj.k8sClientObject();
    }

    toString() {
        return yaml.stringify(this._yaml);
    }
}

export { K8sManifest };