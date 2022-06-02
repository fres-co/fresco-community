# Building fresco extensions

An extension is a webpage embedded inside an iframe element.
This means that to get started you will have to build a publicly accessible webpage.
Not sure where to start? You can take inspiration from the extensions in this folder.

## Loading the SDK

In order to interact with the fresco webpage, you need to use the fresco SDK.
the easiest way to get it is to add the following snippet in your html head element.

```html
<script src="https://fres-co.github.io/fresco-community/loadSdk.js"></script>
```

The SDK will expose a `fresco` object available in your iframe's Javascript global scope.

## fresco.onReady

fresco.onReady is a function that needs to be called with a callback in the parameter.
The callback will be called once the sdk is correctly initialized.
You should call other `fresco` methods only once this initial callback has been called.

## fresco.element

Inside your javascript code, you will be able to access some information about the fresco space and your specific element using the `fresco.element` object.

here a complete list of keys available on it:

- `id`: the fresco element id. Will be uniq
- `state`: the state object, see next section
- `storage`: the storage object, see next section

also some depreacted key that have been moved:

- `participantId`: Moved into `fresco.localParticipant.id`
- `isLocalParticipantInside`: Moved into `fresco.localParticipant.isInsideElement`
- `totalParticipantsCount`: Replaced by into `fresco.remoteParticipants.length`

## fresco.space

- `id`: the curren fresco space id, also knows as diagramId

## fresco.localParticipant

- `id`: current id of the local participant. not persistant across sessions
- `permission`: an object with permission of local user inside the space
  - `canAccess`: boolean; Whether the user is allowd to access the space. should always be true at this point;
  - `canEdit`: boolean; Whether the user can make any modification to the space;
  - `canLock`: boolean; Whether the user edit locked objects;
  - `canConfig`: boolean; Whether the user can update the space settings;
- `isInsideElement`: a flag to know if the local participant position is inside the shape bounds.

## fresco.remoteParticipants

- `length` : the number of remote participants

## State, configuration and storage

A fresco extension has an internal state that can be shared and persisted across users.
This allows a developer to easily save data and implement realtime mechanisms for the extension.
State may only be updated by users who have `canEdit` permissions on the space.
For more a complex scenario, since you have the full power of Javascript available, you should be able to add any persistence or communication layer you might need.

A fresco extension can also expose some configuration options to the user.
As a user, I will configure the extension thought the toolbar, as for other fresco elements.
Using the configuration will update the extension state.

The `storage` object provides a way for users without `canEdit` permission to persist data against the extension.

## Initializing the state and config

```
fresco.initialize(defaultState, config)
```

In order for an extension to display options of saved internal states, the `fresco.initialize` needs to be called.
The first parameter will be the `defaultState`, while the second one will be the configuration options.
The state consists of a simple Javascript object, that can be serialized.

The `config` parameter is an object that contains two attributes:

- `title`: the title of the extension that will be used on top of the emebed content
- `toolbarButtons`: an array of `IElementToolbarButtonConfig`, which list the configuration element to add to the toolbar for this element

For each toolbar button, one must specify a `title`, a `property` name, an optional `icon`, and a configuration for `ui`.

The `title` will be used as label for the user
The `property` will be used as the javascript key to get the value of the state.
The `ui`, will be a Javascript Object, with a `type` string, and optional keys.
For an example of the different options, please see [the configurables extension](https://github.com/fres-co/fresco-community/blob/gh-pages/elements/configurables/index.js).

## Accessing the state, config and storage

The extension state is available inside the `fresco.element.state` javascript object.
Inside it, a user will be able to access values such as defined in the `defaultState` or configured.
The extension storage is available inside the `fresco.element.storage` object and defaults to an empty object.

## Reacting to state or storage change

When the state is updated, the extension will probably need to be aware of this change.
This will allows for example to update the UI.
In order to do so, one can subscribe to the state change, by calling `fresco.onStateChanged`, and providing a callback to it.
The callback will be called without any parameter.
State will need to be retrieved using the previously described `fresco.element.state` object, and the storage from `fresco.element.storage`.

## Updating state

An extension can update part of it's state using the `fresco.setState` method.
The `setState` method will be called with a javascript object corresponding to the part of the state that need to be updated.
Only users with admin permissions on a space may update state.

## Updating storage

See [fresco.d.ts](reigns/src/fresco.d.ts).

## Interact with the space

An extension can also interact with the space in new way.
For now, it can show two types of messages.

#### System message

`fresco.showSystemMessage` allows an extension to show a temporary toas message to the local participant It takes a single parameter, the text string to display.

### Participant message

`fresco.showParticipantMessage` allows an extension to show a temporary message on top of the local participant.
It takes two parameters.
The first one is the text string to display.
The second one is `options` which accepts the following values:

- `color`: a string to describe the text color of the message
- `background`: a string to describe the background color or the message

## Subscribing to space events

See [fresco.d.ts](reigns/src/fresco.d.ts).
