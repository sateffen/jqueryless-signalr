import jQueryDeferred from 'jquery-deferred';
import jQueryParam from 'jquery-param';

/**
 * This function acts as jquery function, so it wrapps given items
 * @param {any} aItem The item that should be wrapped by jquery proxy
 * @returns {Object} The wrapped item
 */
function jQueryFunction(aItem) {
    const events = aItem.events || {};

    // if the passed thing is the window element, we return a window specific object
    if (aItem === window) {
        return {
            0: aItem,
            load: (handler) => aItem.addEventListener('load', handler),
            bind: (event, handler) => aItem.addEventListener(event, handler),
            unbind: (event, handler) => aItem.removeEventListener(event, handler)
        };
    }
    // else we return a default jquery like wrapped item
    return {
        // by default at 0 we have the item value
        0: aItem,
        // allow binding events
        bind(aEvent, aHandler) {
            if (!Array.isArray(events[aEvent])) {
                events[aEvent] = [];
            }

            events[aEvent].push(aHandler);
            aItem.events = events;
        },
        // allow unbinding events
        unbind(aEvent, aHandler) {
            if (Array.isArray(events[aEvent]) && !!aHandler) {
                const index = events[aEvent].indexOf(aHandler);

                if (index !== -1) {
                    events[aEvent].splice(index, 1);
                }
            }

            aItem.events = events;
        },
        triggerHandler(aEvent, aArgs) {
            if (Array.isArray(events[aEvent])) {
                let args = [{type: aEvent}];

                if (Array.isArray(aArgs)) {
                    args = args.concat(aArgs)
                }
                else if (aArgs !== undefined) {
                    args.push(aArgs);
                }

                for (let i = 0, iLen = events[aEvent].length; i < iLen; i++) {
                    events[aEvent][i].apply(this, args);
                }
            }
        },
    };
}

/**
 * Simulates the jquery ajax function used by signalr
 * @param {Object} aOptions The call options for this request
 * @returns {{abort: (function(*=))}}
 */
function ajax(aOptions) {
    // first we generate our request
    const request = new window.XMLHttpRequest();

    // then we setup the ready state change handler, to listen for the time it's ready
    request.onreadystatechange = () => {
        // if the request is not ready yet, we're not doing anything
        if (request.readyState !== 4) {
            return;
        }

        if (request.status === 200) {
            // here we just pass the responseText back to signalR, because signalR has it's own response-parsing builtin
            typeof aOptions.success === 'function' && aOptions.success(request.responseText);
        }
        // else some worms ate up the server and it crys for help. We don't care, but indicate an error
        else {
            typeof aOptions.error === 'function' && aOptions.error(request);
        }
    };

    // if there are any xhrFields passed, we parse them as well and handle them just fine
    if (typeof aOptions.xhrFields === 'object' && aOptions.xhrFields !== null) {
        if (typeof aOptions.xhrFields.withCredentials === 'boolean') {
            request.withCredentials = aOptions.xhrFields.withCredentials;
        }

        if (typeof aOptions.xhrFields.onprogress === 'function') {
            request.addEventListener('progress', aOptions.xhrFields.onprogress);
        }
    }

    // if there is a timeout defined, we setup a timer aborting the request. Because the send is sync and the timeout
    // async, we can place this here
    if (typeof aOptions.timeout === 'number' && aOptions.timeout > 0) {
        window.setTimeout(() => request.abort(), aOptions.timeout);
    }

    // then we open the connection
    request.open(aOptions.type, aOptions.url);

    // and now we're trying to determine the data to send. By default we send null
    let dataToSend = null;

    // but if a contentType is given and we got an data object
    if (typeof aOptions.contentType === 'string' && typeof aOptions.data === 'object' && aOptions.data !== null) {
        // we can set the data to send. To determime the correct form of data, we examine the contentType.
        dataToSend = aOptions.contentType.indexOf('application/x-www-form-urlencoded') === 0 ?
            // jQueryParam returns always a string, and according to jQuery we have to replace %20 with +, see
            // https://github.com/jquery/jquery/issues/2658. The only other option is json, so we choose json as default
            jQueryParam(aOptions.data).replace(/%20/g, '+') : JSON.stringify(aOptions.data);

        // and then we set the content-type header, because we actually have an header value
        request.setRequestHeader('content-type', aOptions.contentType);
    }

    // then we send the data to the server
    request.send(dataToSend);

    // and we return an object with an abort method, because signalR might use it
    return {
        abort(aReason) {
            request.abort(aReason);
        }
    };
}

/**
 * Makes an array based on given potential array
 * @param {any} aPotentialArray The potential array to transform
 * @returns {Array} The resulting array
 */
function makeArray(aPotentialArray) {
    return Array.prototype.slice.call(aPotentialArray);
}

/**
 * Tests whether given object has no keys
 * @param {Object} aObject The object to test
 * @returns {boolean} The result
 */
function isEmptyObject(aObject) {
    return typeof aObject !== 'object' || aObject === null || Object.keys(aObject).length === 0;
}

/**
 * Trims given string
 * @param {String} aString The string to trim
 * @returns {string} The trimmed string
 */
function trim(aString) {
    return typeof aString === 'string' && aString.trim();
}

/**
 * Tests if given item is in given array
 * @param {Array} aArray The array potentially containing the item
 * @param {any} aItem The potential item
 * @returns {boolean} The result
 */
function inArray(aArray, aItem) {
    return Array.isArray(aArray) && aArray.indexOf(aItem) !== -1;
}

const jQueryMethods = {
    defaultAjaxHeaders: null,
    ajax,
    inArray,
    trim,
    isEmptyObject,
    makeArray,
    param: jQueryParam,
    support: {
        cors: (() => {
            const xhrObj = new window.XMLHttpRequest();

            return 'withCredentials' in xhrObj;
        })(),
    },
};

export const jQueryShim = jQueryDeferred.extend(
    jQueryFunction,
    jQueryMethods,
    jQueryDeferred
);
