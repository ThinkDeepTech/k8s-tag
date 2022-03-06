import yaml from 'yaml';

class Manifest {
    constructor(yamlString) {

        if (!(typeof yamlString === 'string') || !(yamlString.length > 0)) {
            throw new Error(`The provided yaml must be a valid string. Received: ${yamlString}`);
        }

        this._yaml = yaml.parse(yamlString);

        this._api = api(this._yaml);

        this._kind = kind(this._yaml);

        this._metadata = metadata(this._yaml);

        this._obj = new this._kind(this._yaml);
    }

    async create () {
        const strategy = creationStrategy(this._api, this._kind);
        strategy(this._metadata.namespace, this._obj);
    }

    async delete () {
        const strategy = deletionStrategy(this._api, this._kind);
        strategy(this._metadata.namespace, this._obj);
    }
}

export { Manifest };