import { assembleYamlString } from "./assemble-yaml-string.mjs";
import { K8sObject } from "./k8s-object.mjs"
import {parse} from "yaml";

const k8s = (strings, ...args) => {

    const yamlString = assembleYamlString(strings, args);

    const parsedYaml = parse(yamlString);

    return new K8sObject(parsedYaml);
};

export { k8s };