# SignalR Extended

This lib provides a basic version of signalR v2.2.1 wrapped with a jquery shim,
so you won't need a complete jquery environment for using it.

## API

The default export if this library equals the *$.hubConnection* function, which
helps you to setup your hub. For details of the original API see [here](https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client).

## Example

Because the API description might not be that useful, I'll provide an example
showing how to use this library correctly:

```js
// first we import the signalR library
const signalR = require('signalr-extended');
// then we define the connection options. You can use all options from the original
const connectionOptions = {
    useDefaultPath: false // whether to use the default path or not
    // transport: array of any allowed transports (options: webSockets, foreverFrame, serverSentEvents, longPolling)
    // and any other options I don't know...
};
// then we create the connection itself
const connection = signalR('/signalr', connectionOptions);

// here we define the query string for this connection. Usually you want to provide
// any authentication here
connection.qs = {token: 'authenticationtoken', version: '1.0.0'};

// then we create a hub proxy. We have to define one proxy per hub we want to use
const myHub = connection.createHubProxy('myHub');

// and register all callbacks on the hub. So here we tell the hub, that we can
// receive "echo" messages from the backend
myHub.on('receiveEcho', message => console.log('GOT ECHO', message));
// ... define other listeners as well. To unregister them use myHub.off(event, listener)

// then we start the connection. this returns a jquery deferred, which has *done/fail*
// instead of *then/catch*.
connection.start()
    .done(() => {
        // because the connection is now established successfully, we call the *sendEcho*
        // method on myHub, with 1 argument, the string "HELLO WORLD". You have
        // to invoke the methods according to their signature, so echoing a number won't
        // work in this case
        myHub.invoke('sendEcho', 'HELLO WORLD');
    })
    .fail(() =>  console.log('could not connect'));

// if we want to stop the connection, we can call connection.stop()
```

## License

SignalR is licensed under [Apache License Version 2.0](https://github.com/SignalR/SignalR/blob/dev/LICENSE.txt).
You can find a copy of the license in the *SIGNALR-LICENSE* file. The rest of
the code written here is licensed under the terms of MIT (see *LICENSE* file).