import yaml from "yaml";
import k8s from "@kubernetes/client-node";

class K8sManifest {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${yaml.stringify(parsedYaml)}`);

        this._yaml = parsedYaml;
        this._obj = this._k8sClientObject(`V1${this._yaml.kind}`, this._yaml);
    }

    kind() {
        return this._obj.kind;
    }

    metadata() {
        return this._obj.metadata;
    }

    toString() {
        return k8s.dumpYaml(this._obj);
    }

    k8sClientObject() {
        return this._obj;
    }

    _k8sClientObject(typeName, value) {

        if ((typeof value !== 'object') && !(Array.isArray(value)))
            return value;

        if (typeName === 'Date')
            return Date.parse(value) || null;

        let subject = null;
        if (typeName.includes('Array')) {

            return this._handleArrayType(typeName, value);

        } else if (typeName.includes('{')) {

            return this._handleMap(typeName, value);

        } else {

            return this._handleClientObjectType(typeName, value);
        }
    }

    _attributeTypeMap(typeName, attributeName) {

        const attributeTypeMaps = k8s[typeName]['getAttributeTypeMap']();

        let targetTypeMap = {};
        for (const prospectiveTypeMap of attributeTypeMaps) {
            if (prospectiveTypeMap.name === attributeName) {
                targetTypeMap = prospectiveTypeMap;
            }
        }

        if (this._emptyMap(targetTypeMap)) {
            throw new Error(`
                The attribute with name ${attributeName} and type ${typeName} wasn't found in the type map. Are you sure it's acceptible in kubernetes yaml configurations?
            `);
        }

        return targetTypeMap;
    }

    _handleArrayType(typeName, value) {

        let subject = [];

        const elementType = typeName.match(/(?<=\<)(.*?)(?=\>)/)[0];

        if (!elementType) {
            throw new Error(`Could not match array element type for type ${typeName}`);
        }

        for (const entry of value) {
            subject.push(this._k8sClientObject(elementType, entry));
        }

        return subject;
    }

    _handleMap(typeName, value) {

        let subject = {};

        const propertyType = typeName.match(/(?<=\{ \[key: string\]: )(.*?)(?=; \})/)[0];

        for (const attribute in value) {
            subject[attribute] = this._k8sClientObject(propertyType, value[attribute]);
        }

        return subject;
    }

    _handleClientObjectType(typeName, value) {

        let subject = new k8s[typeName]();

        for (const attribute in value) {

            const targetTypeMap = this._attributeTypeMap(typeName, attribute);

            subject[attribute] = this._k8sClientObject(targetTypeMap.type, value[attribute]);

        }

        return subject;
    }

    _emptyMap(map) {
        return Object.keys(map).length === 0;
    }
}

export { K8sManifest };