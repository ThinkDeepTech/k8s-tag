import k8s from "@kubernetes/client-node";
import yaml from "yaml";

class K8sManifest {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${yaml.stringify(parsedYaml)}`);

        this._yaml = parsedYaml;

        const objectPrefix = this._objectVersion(this._yaml.apiVersion);
        this._obj = this._k8sClientObject(`${objectPrefix}${this._yaml.kind}`, this._yaml);
    }

    get kind() {
        return this._obj.kind;
    }

    get metadata() {
        return this._obj.metadata;
    }

    toString() {
        return k8s.dumpYaml(this._obj);
    }

    k8sClientObject() {
        return this._obj;
    }

    _k8sClientObject(typeName, value) {

        if (this._baseType(typeName, value)) {

            if (this._dateType(typeName) && !!value) {
                return new Date(value);
            }

            return value;
        } else if (this._arrayType(typeName)) {

            return this._handleArrayType(typeName, value);
        } else if (this._mapType(typeName)) {

            return this._handleMap(typeName, value);
        } else {

            return this._handleClientObjectType(typeName, value);
        }
    }

    _baseType(typeName, value) {
        return (!this._mapType(typeName) && !this._arrayType(typeName) && !this._object(value)) || this._dateType(typeName);
    }

    _object(value) {
        return typeof value === 'object';
    }

    _dateType(typeName) {
        return typeName === 'Date';
    }

    _arrayType(typeName) {
        return typeName.includes('Array');
    }

    _mapType(typeName) {
        return typeName.includes('{');
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

        const elementType = typeName.match(/(?<=Array\<)(.*?)(?=\>)/)[0];

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

        const propertyType = typeName.match(/(?<=\{ \[key: \w+\]: )(.*?)(?=; \})/)[0];

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

    _objectVersion(apiVersion) {
        if (!apiVersion.includes('/')) {
            return this._capitalizeFirstLetter(apiVersion);
        } else {

            const parts = apiVersion.split('/');
            const lastPart = parts[parts.length - 1];
            return this._capitalizeFirstLetter(lastPart);
        }
    }

    _capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    _emptyMap(map) {
        return Object.keys(map).length === 0;
    }
}

export { K8sManifest };