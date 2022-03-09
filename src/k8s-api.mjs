import k8s from '@kubernetes/client-node';

class K8sApi {
    constructor(parsedYaml) {
        this._kubeConfig = new k8s.KubeConfig();
        this._kubeConfig.loadFromCluster();
        this._api = this._determineApiToUse(parsedYaml);
    }

    async create(manifest) {
        console.log(`Creating: ${manifest.toString()}`);
        return this._creationStrategy(manifest)();
    }

    async delete(manifest) {
        console.log(`Deleting: ${manifest.toString()}`);
        return this._deletionStrategy(manifest)();
    }

    _creationStrategy(manifest) {
        console.log('Fetching creation strategy');
        switch(manifest.kind()) {
            case 'CronJob': {
                console.log(`Using cron job creation strategy for ${JSON.stringify(manifest.metadata())} \n ${JSON.stringify(manifest.object())}`)
                return this._api.createNamespacedCronJob.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Job': {
                console.log(`Using job creation strategy for ${JSON.stringify(manifest.metadata())} \n ${JSON.stringify(manifest.object())}`)
                return this._api.createNamespacedJob.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Pod': {
                console.log(`Using pod creation strategy for ${JSON.stringify(manifest.metadata())} \n ${JSON.stringify(manifest.object())}`)
                return this._api.createNamespacedPod.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Secret': {
                console.log(`Using secret creation strategy for ${JSON.stringify(manifest.metadata())} \n ${JSON.stringify(manifest.object())}`)
                return this._api.createNamespacedSecret.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            default: {
                throw new Error(`K8s manifest kind not recognized. Received: ${manifest.kind()}`);
            }
        }
    }

    _deletionStrategy(manifest) {
        switch(manifest.kind()) {
            case 'CronJob': {
                console.info(`Using cron job deletion strategy: name ${manifest.metadata().name}, namespace ${manifest.metadata().namespace}`);
                return this._api.deleteNamespacedCronJob.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Job': {
                console.info(`Using job deletion strategy: name ${manifest.metadata().name}, namespace ${manifest.metadata().namespace}`);
                return this._api.deleteNamespacedJob.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Pod': {
                console.info(`Using pod deletion strategy: name ${manifest.metadata().name}, namespace ${manifest.metadata().namespace}`);
                return this._api.deleteNamespacedPod.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Secret': {
                console.info(`Using secret deletion strategy: name ${manifest.metadata().name}, namespace ${manifest.metadata().namespace}`);
                return this._api.deleteNamespacedSecret.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
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
            case "v1": {
                return this._kubeConfig.makeApiClient(k8s.CoreV1Api);
            }
            default: {
                throw new Error(`The k8s apiVersion wasn't recognized. Received: ${apiVersion}`);
            }
        }
    }
}

export { K8sApi };