import { stringify } from "yaml";

class K8sObject {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${stringify(parsedYaml)}`);

        this._obj = this._constructObject(parsedYaml);
    }

    _constructObject(parsedYaml) {

        for (const node in parsedYaml) {
            const obj = this._k8sClientObject(node, parsedYaml[node]);
        }
    }

    _k8sClientObject(node, nodeValue) {
        if (typeof nodeValue !== 'object' && !Array.isArray(nodeValue)) {
            return nodeValue;
        } else if (Array.isArray(nodeValue)) {
            // TODO:
        } else {
            const k8sClientObject = this._convertToK8sClientObject(nodeValue)
            const obj = this._constructObject(nodeValue);

        }
    }
}

export { K8sObject };