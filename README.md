# express-temp-links

**express-temp-links** is an express module to use temporary routes easily

**READ THIS BEFORE USE:** since this module stores links in memory the links will become inaccessible after a server restart but you can use `import` and `export` methods to save links in a database using JSON format

## Installation

```bash
npm i express-temp-links
```

## Simple usage

```javascript
const express = require( 'express' );
const TempLinks = require( 'express-temp-links' );
const app = express();


// This is an example middleware that checks if the client ip that requested a templink is the same that generated it
const myMiddleware = ( req, res ) => {

    // req.templinks will be defined in temporary link routes
    if ( req.ip === req.templink.refs ) {
        res.send( 'This is a temporary link' );
    } else {
        res.send( 'You are not authorized' );
    }
};


// This instanciates a new set of links that will expire in 10 seconds and call 'myMiddleware' function if a temporary link is requested
const tmpLinks = new TempLinks( { timeOut: 10, callback: myMiddleware } );

// This adds the instance to the selected path (in this example: '/'). You can change parameter name when you instanciate a new links set using 'paramName' option.
app.use( '/:templink', tmpLinks.parser() );

app.get( '/link-generate', ( req, res ) => {

    // This generate a new temporary link, sets client ip as refs parameter and return the new link string
    const link = tmpLinks.get( { refs: req.ip } );

    // This sends link to the client
    res.send( `<a href="http://localhost:3000/${link}">http://localhost:3000/${link}</a>` );
} );

app.listen( 3000 );
```

## Methods

### `TempLinks.constructor`
```javascript
const tmpLinks = new TempLinks( options: Object );
```

#### options

* `timeOut` - Link expiration in seconds (Default: 300)
* `inteval` - Link expiration checking in milliseconds (Default: 1000)
* `oneTime` - It sets if links will be deleted once accessed (Default: true)
* `method` - It sets the default HTTP method (Default: undefined)
* `refs` - It sets any data that can be accessed from req.templink.refs
* `redirect` - Default string that will be passed to res.redirect if it's setted
* `callback` - Default middleware callback that will be launched when links are accessed if it's setted
* `paramName` - The parameter name in express query routing (Default: 'templink')

#### Return
A new `TempLinks` instance that extends `EventEmitter` class, emits an `added` event when a link is created and passes that

### `TempLinks.add`
```javascript
tmpLinks.add( options: Object );
```

#### options

* `timeOut` - Link timeout in seconds
* `oneTime` - Delete link once is accessed
* `method` - Any HTTP method you want to use
* `refs` - Any refs you want to add to req when the link is accessed
* `redirect` - A string that will be passed to res.redirect method when the link is accessed if it's setted
* `callback` - A middleware callback you want to launch when the link is accessed if it's setted

#### Return
A new temporary link as a string

### `TempLinks.get`
```javascript
tmpLinks.get( options: Object );
```

#### options
The same of `add` method, except for `method`

#### Return
A new temporary link as a string

### `TempLinks.post`
```javascript
tmpLinks.post( options: Object );
```

#### Parameters
The same of `add` method, except for `method`

#### Return
A new temporary link as a string

### `TempLinks.export`
```javascript
tmpLinks.export()
```

#### Return
The active links as a JSONable Object

### `TempLinks.import`
```javascript
tmpLinks.import( links: Object [, callback: Function] );
```

#### Parameters
* `links` Required - A set of links that was exported previously
* `callback` Optional - A middleware callback you want to associate to imported links

## Advanced usage

```javascript
const express = require( 'express' );
const TempLinks = require( 'express-temp-links' );
const app = express();


// This is an example middleware that checks if the client ip that requested a templink is the same that generated it
const tmpMiddleware = ( req, res ) => {

    // req.templinks will be defined in temporary link routes
    if ( req.ip === req.templink.refs ) {
        res.send( 'This is a temporary link' );
    } else {
        res.send( 'You are not authorized' );
    }
};

// This is another example middleware for another links set
const imgMiddleware = ( req, res, next ) => {

    // Any action
    
    // It launches next middleware function in the same route of the parser
    next();
};


// This instanciates a new set of links that will expire in 10 seconds and it will call 'tmpMiddleware' function if a temporary link is requested
const tmpLinks = new TempLinks( { timeOut: 10, callback: tmpMiddleware } );

// This instanciates a new set of links that will expire in 5 minutes (by default), it will call 'imgMiddleware' function and links can be accessed many times
const imageLinks = new TempLinks( { oneTime: false, callback: imgMiddleware } );

// This logs any generated links for 'tmpLinks' instance
tmpLinks.on( 'added', link => {
    console.log( link );
} );

// These add the instances to the selected paths (in this example: '/' and '/image/'). You can change parameter name when you instanciate a new links set using 'paramName' option.
app.use( '/:templink', tmpLinks.parser() );
app.use( '/image/:templink', imageLinks.parser(), ( req, res, next ) => {
    if ( req.templink ) {
    // If this req is an active templink...

        // It sends 'Hello world'
        res.send( req.templink.refs.join(' ') );
    } else {
        next();
    }
} )


app.get( '/link-generate', ( req, res ) => {

    // This generate a new temporary link, sets client ip as refs parameter and return the new link string
    const link = tmpLinks.get( { refs: req.ip } );

    // This generate a new temporary link, sets a refs parameter and return the new link string
    const imgLink = imageLinks.get( { refs: ['Hello', 'world'] } );

    // These send links to the client
    res.send( `<a href="http://localhost:3000/${link}">http://localhost:3000/${link}</a>` );
    res.send( `<a href="http://localhost:3000/${imgLink}">http://localhost:3000/${imgLink}</a>` );
} );

app.listen( 3000 );
```