module.exports = function(file, api) {
    // first we alias the api
    const j  = api.jscodeshift;

    // then we parse the target file
    const fileSource = j(file.source)
        // search for all window.jQuery calls
        .find(j.MemberExpression, {object: {name: 'window'}, property: {name: 'jQuery'}})
        // and replace them with the identifier jQueryShim
        .replaceWith(p => j.identifier('jQueryShim'))
        .toSource();

    // And finally we return the new sourcecode, which is wrapped by an import and an export
    return 'import {jQueryShim} from "./jqueryshim";\n' +
        fileSource +
        '\nconst signalR = jQueryShim.hubConnection;\nexport default signalR;'
}