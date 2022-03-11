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
                console.log(`Using cron job creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedCronJob.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Job': {
                console.log(`Using job creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedJob.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Pod': {
                console.log(`Using pod creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedPod.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Secret': {
                console.log(`Using secret creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedSecret.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Service': {
                console.log(`Using service creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedService.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Deployment': {
                console.log(`Using deployment creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedDeployment.bind(this._api, manifest.metadata().namespace, manifest.object());
            }
            case 'Namespace': {
                console.log(`Using namespace creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespace.bind(this._api, manifest.object());
            }
            default: {
                throw new Error(`K8s manifest kind not recognized. Received: ${manifest.kind()}`);
            }
        }
    }

    _deletionStrategy(manifest) {

        switch(manifest.kind()) {
            case 'CronJob': {
                console.log(`Using cron job deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedCronJob.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Job': {
                console.log(`Using job deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedJob.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Pod': {
                console.log(`Using pod deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedPod.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Secret': {
                console.log(`Using secret deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedSecret.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Service': {
                console.log(`Using service deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedService.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Deployment': {
                console.log(`Using deployment deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedDeployment.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'Namespace': {
                console.log(`Using namespace deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespace.bind(this._api, manifest.metadata().name);
            }
            default: {
                throw new Error(`K8s manifest kind not recognized. Received: ${manifest.kind()}`);
            }
        }
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
                throw new Error(`The k8s apiVersion wasn't recognized. Received: ${apiVersion}`);
            }
        }
    }
}

export { K8sApi };