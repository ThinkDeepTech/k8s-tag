import k8s from '@kubernetes/client-node';

class K8sApi {
    constructor(parsedYaml) {

        this._apiVersionMap = {
                "apps/v1": () => this._kubeConfig.makeApiClient(k8s.AppsV1Api),
                "autoscaling/v1": () => this._kubeConfig.makeApiClient(k8s.AutoscalingV1Api),
                "autoscaling/v1beta1": () => this._kubeConfig.makeApiClient(k8s.AutoscalingV2beta1Api),
                "autoscaling/v1beta2": () => this._kubeConfig.makeApiClient(k8s.AutoscalingV2beta2Api),
                "batch/v1": () => this._kubeConfig.makeApiClient(k8s.BatchV1Api),
                "batch/v1beta1": () => this._kubeConfig.makeApiClient(k8s.BatchV1beta1Api),
                "certificates.k8s.io/v1": () => this._kubeConfig.makeApiClient(k8s.CertificatesV1Api),
                "certificates.k8s.io/v1beta1": () => this._kubeConfig.makeApiClient(k8s.CertificatesV1beta1Api),
                "extensions/v1beta1": () => this._kubeConfig.makeApiClient(k8s.ExtensionsV1beta1Api),
                "policy/v1": () => this._kubeConfig.makeApiClient(k8s.PolicyV1Api),
                "policy/v1beta1": () => this._kubeConfig.makeApiClient(k8s.PolicyV1beta1Api),
                "rbac.authorization.k8s.io/v1": () => this._kubeConfig.makeApiClient(k8s.RbacAuthorizationV1Api),
                "rbac.authorization.k8s.io/v1alpha1": () => this._kubeConfig.makeApiClient(k8s.RbacAuthorizationV1alpha1Api),
                "rbac.authorization.k8s.io/v1beta1": () => this._kubeConfig.makeApiClient(k8s.RbacAuthorizationV1beta1Api),
                "v1": () => this._kubeConfig.makeApiClient(k8s.CoreV1Api)
        };

        this._kubeConfig = new k8s.KubeConfig();
        this._kubeConfig.loadFromCluster();
        this._api = this._determineApiToUse(parsedYaml, this._apiVersionMap);
    }

    async create(manifest) {
        return this._creationStrategy(manifest)();
    }

    async delete(manifest) {
        return this._deletionStrategy(manifest)();
    }

    _creationStrategy(manifest) {

        const kind = manifest.kind;
        if (this._api[`createNamespaced${kind}`]) {

            return this._api[`createNamespaced${kind}`].bind(this._api, manifest.metadata.namespace, manifest.k8sClientObject());
        } else if (this._api[`create${kind}`]) {

            return this._api[`create${kind}`].bind(this._api, manifest.k8sClientObject());
        } else {
            throw new Error(`
                The creation function for kind ${kind} wasn't found. This may be because it hasn't yet been implemented. Please submit an issue on the github repo relating to this.
            `)
        }
    }

    _deletionStrategy(manifest) {

        const kind = manifest.kind;
        if (this._api[`deleteNamespaced${kind}`]) {

            return this._api[`deleteNamespaced${kind}`].bind(this._api, manifest.metadata.name, manifest.metadata.namespace);
        } else if (this._api[`delete${kind}`]) {

            return this._api[`delete${kind}`].bind(this._api, manifest.metadata.name);
        } else {
            throw new Error(`
                The deletion function for kind ${kind} wasn't found. This may be because it hasn't yet been implemented. Please submit an issue on the github repo relating to this.
            `)
        }
    }

    _determineApiToUse(parsedYaml, apiVersionMap) {

        const apiVersion = parsedYaml.apiVersion.toLowerCase();

        const constructApi = apiVersionMap[apiVersion];

        if (!constructApi) {
            throw new Error(`The k8s apiVersion not yet supported. Received: ${apiVersion}`);
        }

        return constructApi();
    }
}

export { K8sApi };