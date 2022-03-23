var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import k8s from '@kubernetes/client-node';
class K8sApi {
    constructor(parsedYaml) {
        this._kubeConfig = new k8s.KubeConfig();
        this._kubeConfig.loadFromCluster();
        this._api = this._determineApiToUse(parsedYaml);
    }
    create(manifest) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._creationStrategy(manifest)();
        });
    }
    delete(manifest) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._deletionStrategy(manifest)();
        });
    }
    _creationStrategy(manifest) {
        switch (manifest.kind()) {
            case 'CronJob': {
                console.log(`Using cron job creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedCronJob.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'Job': {
                console.log(`Using job creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedJob.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'Pod': {
                console.log(`Using pod creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedPod.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'Secret': {
                console.log(`Using secret creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedSecret.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'Service': {
                console.log(`Using service creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedService.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'Deployment': {
                console.log(`Using deployment creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedDeployment.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'Namespace': {
                console.log(`Using namespace creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespace.bind(this._api, manifest.k8sClientObject());
            }
            case 'ConfigMap': {
                console.log(`Using configmap creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedConfigMap.bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            case 'PersistentVolume': {
                console.log(`Using persistent volume creation strategy for \n${manifest.toString()}\n`);
                return this._api.createPersistentVolume.bind(this._api, manifest.k8sClientObject());
            }
            case 'PersistentVolumeClaim': {
                console.log(`Using persistent volume claim creation strategy for \n${manifest.toString()}\n`);
                return this._api.createNamespacedPersistentVolumeClaim().bind(this._api, manifest.metadata().namespace, manifest.k8sClientObject());
            }
            default: {
                throw new Error(`K8s manifest kind not yet supported. Received: ${manifest.kind()}`);
            }
        }
    }
    _deletionStrategy(manifest) {
        switch (manifest.kind()) {
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
            case 'ConfigMap': {
                console.log(`Using configmap deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedConfigMap.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            case 'PersistentVolume': {
                console.log(`Using persistent volume deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deletePersistentVolume.bind(this._api, manifest.metadata().name);
            }
            case 'PersistentVolumeClaim': {
                console.log(`Using persistent volume claim deletion strategy for \n${manifest.toString()}\n`);
                return this._api.deleteNamespacedPersistentVolumeClaim.bind(this._api, manifest.metadata().name, manifest.metadata().namespace);
            }
            default: {
                throw new Error(`K8s manifest kind not yet supported. Received: ${manifest.kind()}`);
            }
        }
    }
    _determineApiToUse(parsedYaml) {
        const apiVersion = parsedYaml.apiVersion.toLowerCase();
        switch (apiVersion) {
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