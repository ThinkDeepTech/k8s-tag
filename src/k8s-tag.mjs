import { assembleYamlString } from "./assemble-yaml-string.mjs";
import { K8sClient } from "./k8s-client.mjs"
import yaml from "yaml";

const k8s = (strings, ...args) => {

    const yamlString = assembleYamlString(strings, args);

    const parsedYaml = yaml.parse(yamlString);

    return new K8sClient(parsedYaml);
};

export { k8s };