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
        switch(manifest.kind()) {
            case 'CronJob': {
                return this._api.createNamespacedCronJob.bind(this._api, manifest.metadata().namespace(), manifest.toObject());
            }
            default: {
                throw new Error(`K8s manifest kind not recognized. Received: ${manifest.kind()}`);
            }
        }
    }

    _deletionStrategy(manifest) {
        switch(manifest.kind()) {
            case 'CronJob': {
                // await this._api.deleteNamespacedCronJob(this._cronJob.metadata.name, this._namespace);
                return this._api.deleteNamespacedCronJob.bind(this._api, manifest.metadata().name(), manifest.metadata().namespace());
            }
            default: {
                throw new Error(`K8s manifest kind not recognized. Received: ${manifest.kind()}`);
            }
        }
    }

    _determineApiToUse(parsedYaml) {

        const apiVersion = parsedYaml.apiVersion.toLowerCase();
        switch(apiVersion) {
            case "batch/v1": {
                return this._kubeConfig.makeApiClient(k8s.BatchV1Api);
            }
            default: {
                throw new Error(`The k8s apiVersion wasn't recognized. Received: ${apiVersion}`);
            }
        }
    }
}

export { K8sApi };