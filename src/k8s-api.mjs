import k8s from '@kubernetes/client-node';

class K8sApi {
    constructor(parsedYaml) {
        this._kubeConfig = new k8s.KubeConfig();
        this._kubeConfig.loadFromCluster();
        this._api = this._determineApiToUse(parsedYaml);
    }

    async create(manifest) {
        return this._creationStrategy(manifest)();
    }

    async delete(manifest) {
        return this._deletionStrategy(manifest)();
    }

    _creationStrategy(manifest) {

        const kind = manifest.kind();

        let strategy = async () => { };
        if (this._api[`createNamespaced${kind}`]) {
            strategy = this._api[`createNamespaced${kind}`].bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
        } else if (this._api[`create${kind}`]) {
            strategy = this._api[`create${kind}`].bind(this._api, manifest.k8sClientObject());
        } else {
            throw new Error(`
                The creation function for kind ${kind} wasn't found. This may be because it hasn't yet been implemented. Please submit an issue on the github repo relating to this.
            `)
        }

        return strategy;
    }

    _deletionStrategy(manifest) {

        const kind = manifest.kind();

        let strategy = async () => { };
        if (this._api[`deleteNamespaced${kind}`]) {
            strategy = this._api[`deleteNamespaced${kind}`].bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
        } else if (this._api[`delete${kind}`]) {
            strategy = this._api[`delete${kind}`].bind(this._api, manifest.metadata().name);
        } else {
            throw new Error(`
                The deletion function for kind ${kind} wasn't found. This may be because it hasn't yet been implemented. Please submit an issue on the github repo relating to this.
            `)
        }

        return strategy;
    }

    _determineApiToUse(parsedYaml) {

        const apiVersion = parsedYaml.apiVersion.toLowerCase();
        switch(apiVersion) {
            case "apps/v1": {
                return this._kubeConfig.makeApiClient(k8s.AppsV1Api);
            }
            case "batch/v1": {
                return this._kubeConfig.makeApiClient(k8s.BatchV1Api);
            }
            case "v1": {
                return this._kubeConfig.makeApiClient(k8s.CoreV1Api);
            }
            default: {
                throw new Error(`The k8s apiVersion not yet supported. Received: ${apiVersion}`);
            }
        }
    }
}

export { K8sApi };