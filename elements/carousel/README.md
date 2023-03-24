# description

This Element enables the display of an image and allows users to switch between images from a list.
When switching between images, users can choose to display the next image in the list or choose one at random.

The list of images can be provided as a parameter in the fresco element. Each image must be provided via a URL. Multiple images can be set by separating the URLs with the '|' character."

# Set up

1. Add an entry in hosts:

```
    127.0.0.1 dev-community.fres.co
```

2. Set up your web server to respond to https://dev-community.fres.co/ (points to the root of the repo)

# To add the carousel to a fres.co space

1. Copy the following snippet

```
    extension://dev-community.fres.co/elements/carousel/index.htm
```

2. Paste it in the space

# Source of inspiration

Although we have already deviated from Miro's SDK, it is a good reference.
https://developers.miro.com/docs/how-to-start
https://github.com/miroapp/app-examples/blob/master/miro.d.ts
