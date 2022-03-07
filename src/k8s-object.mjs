class K8sObject {
    constructor(parsedYaml) {

        this._api = new K8sApi(parsedYaml);
        this._manifest = new K8sManifest(parsedYaml);

        // this._api = api(this._yaml);
        // this._kind = kind(this._yaml);
        // this._metadata = metadata(this._yaml);
        // this._obj = new this._kind(this._yaml);
    }

    async create () {
        // const strategy = creationStrategy(this._api, this._kind);
        // strategy(this._metadata.namespace, this._obj);
        this._api.create(this._manifest);

    }

    async delete () {
        // const strategy = deletionStrategy(this._api, this._kind);
        // strategy(this._metadata.namespace, this._obj);
        this._api.delete(this._manifest);
    }

    toString() {
        // TODO
    }
}

export { K8sObject };