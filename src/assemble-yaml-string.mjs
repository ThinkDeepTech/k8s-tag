const assembleYamlString = (strings, args) => {

    if (!Array.isArray(strings) || !(strings.length > 0) || !Array.isArray(args))
        throw new Error(`Valid inputs must be supplied.`);

    let yamlString = strings[0];
    for (let i = 0; i < args.length; i++) {
        const variable = args[i];
        const str = strings[i + 1];

        yamlString = yamlString.concat(`${variable}`).concat(str);
    }

    return yamlString;
}

export { assembleYamlString };