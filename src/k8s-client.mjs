class K8sClient {
    constructor(parsedYaml) {

        this._api = new K8sApi(parsedYaml);
        this._manifest = new K8sManifest(parsedYaml);
    }

    async create () {
        this._api.create(this._manifest);
    }

    async delete () {
        this._api.delete(this._manifest);
    }

    toString() {
        this._manifest.toString();
    }
}

export { K8sClient };