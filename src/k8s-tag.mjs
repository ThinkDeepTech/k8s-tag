import yaml from 'yaml';


const k8s = (strings, ...args) => {
    // let yamlString = '';
    // for (const part of strings) {

    // }

    const yamlString = assembleYamlString(strings, args);

    // const yamlDom = yaml.parse(yamlString);

    const manifest = new Manifest(yamlString);



    // const api = k8sApiVersion(yamlDom);

    // const kind = k8sKind(yamlDom);

    // const metadata = k8sMetadata(yamlDom);

    // const kindStrategy = kindStrategy(kind);

    // const spec = kindStrategy(yamlDom);

    return api;
};

export { k8s };