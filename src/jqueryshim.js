/* globals require, module */
import jQueryDeferred from 'jquery-deferred';
import jQueryParam from 'jquery-param';

function jQueryFunction(aSubject) {
    const events = aSubject.events || {};

    if (aSubject && aSubject === aSubject.window) {
        return {
            0: aSubject,
            load: handler => aSubject.addEventListener('load', handler, false),
            bind: (event, handler) => aSubject.addEventListener(event, handler, false),
            unbind: (event, handler) => aSubject.removeEventListener(event, handler, false),
        };
    }

    return {
        0: aSubject,
        unbind(aEvent, aHandler) {
            let handlers = events[aEvent] || [];

            if (aHandler) {
                const index = handlers.indexOf(aHandler);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            } else {
                handlers = [];
            }

            events[aEvent] = handlers;
            aSubject.events = events;
        },
        bind(aEvent, aHandler) {
            const current = events[aEvent] || [];
            events[aEvent] = current.concat(aHandler);
            aSubject.events = events;
        },
        triggerHandler(aEvent, aArgs) {
            const handlers = events[aEvent] || [];

            handlers.forEach((aFunction) => {
                let args = aArgs || [];

                if (aArgs && aArgs[0] && aArgs[0].type === undefined) {
                    args = args.concat([{
                        type: aEvent,
                    }]);
                }

                aFunction.apply(this, args);
            });
        },
    };
}

function xhr() {
    try {
        return new window.XMLHttpRequest();
    } catch (e) {
        return null;
    }
}

function ajax(aOptions) {
    const request = xhr();

    request.onreadystatechange = () => {
        if (request.readyState !== 4) {
            return;
        }

        if (request.status === 200 && !request._hasError) {
            aOptions.success && aOptions.success(JSON.parse(request.responseText));
        }
        else {
            aOptions.error && aOptions.error(request);
        }
    };

    request.open(aOptions.type, aOptions.url);
    request.setRequestHeader('content-type', aOptions.contentType);
    request.send(aOptions.data.data && `data=${aOptions.data.data}`);

    return {
        abort(aReason) {
            request.abort(aReason);
        },
    };
}

function makeArray(aPotentialArray) {
    return Array.prototype.slice.call(aPotentialArray);
}


function isEmptyObject(aObject) {
    return !aObject || Object.keys(aObject).length === 0;
}

function trim(aString) {
    return typeof aString === 'string' && aString.trim();
}

function inArray(aArray, aItem) {
    return aArray.indexOf(aItem) !== -1;
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
            const xhrObj = xhr();
            return Boolean(xhrObj) && 'withCredentials' in xhrObj;
        })(),
    },
};

export const jQueryShim = jQueryDeferred.extend(
    jQueryFunction,
    jQueryMethods,
    jQueryDeferred
);
