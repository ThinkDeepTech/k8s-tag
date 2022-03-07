import { assembleYamlString } from "./assemble-yaml-string.mjs";
import { K8sClient } from "./k8s-client.mjs"
import {parse} from "yaml";

const k8s = (strings, ...args) => {

    const yamlString = assembleYamlString(strings, args);

    const parsedYaml = parse(yamlString);

    return new K8sClient(parsedYaml);
};

export { k8s };