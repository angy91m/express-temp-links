const crypto = require( 'node:crypto' );
const { EventEmitter } = require( 'node:events' );
class TempLinks extends EventEmitter {
    /**
     * 
     * @param {Object}   options           - Options object
     * @param {number}   options.timeOut   - Link expiration in seconds (Default: 300)
     * @param {number}   options.inteval   - Link expiration checking in milliseconds (Default: 1000)
     * @param {boolean}  options.oneTime   - It sets if links will be deleted once accessed (Default: true)
     * @param {string}   options.method    - It sets the default HTTP method (Default: undefined)
     * @param {*}        options.refs      - It sets any data that can be accessed from req.templink.refs
     * @param {string}   options.redirect  - Default string that will be passed to res.redirect if it's setted
     * @param {Function} options.callback  - Default middleware callback that will be launched when links are accessed if it's setted
     * @param {string}   option.paramName  - The parameter name in express query routing (Default: 'templink')
     */
    constructor( options = {} ) {
        super();
        this.timeOut = typeof options.timeOut === 'number' ? options.timeOut * 1000 : 300000;
        this.oneTime = true;
        if ( typeof options.oneTime !== 'undefined' ) {
            this.oneTime = options.oneTime ? true : false;
        }
        this.method = options.method ? options.method.toUpperCase() : undefined;
        this.refs = options.refs;
        this.redirect = options.redirect;
        this.callback = options.callback;
        this.paramName = options.paramName || 'templink';
        this.links = {};
        setInterval( () => {
            for ( const link in this.links ) {
                if ( Date.now() > this.links[link].expiration.getTime() ) {
                    this.links[link].delete();
                }
            }
        }, typeof options.inteval === 'number' ? options.inteval : 1000 );
    }
    /**
     * @param {Object} links - A list of links that was exported previously
     * @param {Function} callback - A middleware callback you want to associate to imported links
    */
    import( links, callback ) {
        for ( const link in links ) {
            const lnk = links[link];
            const expiration = new Date( lnk.expiration );
            if ( Date.now() > expiration.getTime() ) continue;
            this.links[link] = {};
            const thisLink = this.links[link];
            thisLink = {
                expiration,
                oneTime: lnk.oneTime,
                method: lnk.method,
                refs: lnk.refs,
                redirect: lnk.redirect,
                callback,
                delete: () => {
                    delete this.links[link];
                },
                export: () => ({
                    expiration: thisLink.expiration.toISOString(),
                    oneTime: thisLink.oneTime,
                    method: thisLink.method,
                    refs: thisLink.refs,
                    redirect: thisLink.redirect
                })
            }
            if ( !thisLink.redirect && !thisLink.callback ) {
                thisLink.redirect = this.redirect;
                thisLink.callback = this.callback;
            }
        }
    }
    export() {
        const links = {};
        for ( const link in this.links ) {
            links[link] = this.links[link].export();
        }
        return links;
    }
    parser() {
        return ( req, res, next ) => {
            const templink = req.params[this.paramName];
            if (
                typeof templink === 'string'
                && templink.length
                && this.links[templink]
            ) {
                const link = this.links[templink];
                if ( link.method && link.method !== req.method ) return next();
                req.templink = {
                    instance: this,
                    refs: link.refs
                }
                const { redirect, callback } = link;
                if ( link.oneTime ) {
                    link.delete();
                    req.templink.delete = () => {};
                } else {
                    req.templink.delete = () => {
                        link.delete();
                    };
                }
                if ( redirect ) {
                    res.redirect( redirect );
                } else if ( callback ) {
                    callback( req, res, next );
                } else {
                    next();
                }
            } else {
                next();
            }
        };
    }
    /**
     * 
     * @param {Object}      options             - Options object
     * @param {number}      options.timeOut     - Link timeout in seconds
     * @param {boolean}     options.oneTime     - Delete link once is accessed
     * @param {string}      options.method      - Any HTTP method you want to use
     * @param {*}           options.refs        - Any refs you want to add to req when the link is accessed
     * @param {string}      options.redirect    - A string that will be passed to res.redirect method when the link is accessed if it's setted
     * @param {Function}    options.callback    - A middleware callback you want to launch when the link is accessed if it's setted
     */
    add( options ) {
        const { timeOut, oneTime, method, refs, redirect, callback } = options;
        let link = crypto.randomBytes( 32 ).toString( 'hex' );
        while ( typeof this.links[link] !== 'undefined' ) {
            link = crypto.randomBytes( 32 ).toString( 'hex' );
        }
        const expiration = new Date();
        expiration.setTime( Date.now() + ( typeof timeOut === 'number' ? timeOut * 1000 : this.timeOut ) );
        const linkObj = {
            expiration,
            oneTime: typeof oneTime !== 'undefined' ? oneTime : this.oneTime,
            method: typeof method === 'string' ? method.toUpperCase() : this.method,
            refs: typeof refs !== 'undefined' ? refs : this.refs,
            redirect: typeof redirect !== 'undefined' ? redirect : this.redirect,
            callback: typeof callback !== 'undefined' ? callback : this.callback,
            delete: () => {
                delete this.links[link];
            },
            export: () => ({
                expiration: linkObj.expiration.toISOString(),
                oneTime: linkObj.oneTime,
                method: linkObj.method,
                refs: linkObj.refs,
                redirect: linkObj.redirect
            })
        };
        if ( !linkObj.redirect && !linkObj.callback ) {
            linkObj.redirect = this.redirect;
            linkObj.callback = this.callback;
        }
        this.links[link] = linkObj;
        this.emit( 'added', link, linkObj );
        return link;
    }
    /**
     * 
     * @param {Object}      options             - Options object
     * @param {number}      options.timeOut     - Link timeout in seconds
     * @param {boolean}     options.oneTime     - Delete link once is accessed
     * @param {*}           options.refs        - Any refs you want to add to req when the link is accessed
     * @param {string}      options.redirect    - A string that will be passed to res.redirect method when the link is accessed
     * @param {Function}    options.callback    - A middleware callback you want to launch when the link is accessed
     */
    get( options ) {
        options.method = 'GET';
        return this.add( options );
    }
    /**
     * 
     * @param {Object}      options             - Options object
     * @param {number}      options.timeOut     - Link timeout in seconds
     * @param {boolean}     options.oneTime     - Delete link once is accessed
     * @param {*}           options.refs        - Any refs you want to add to req when the link is accessed
     * @param {string}      options.redirect    - A string that will be passed to res.redirect method when the link is accessed
     * @param {Function}    options.callback    - A middleware callback you want to launch when the link is accessed
     */
    post( options ) {
        options.method = 'POST';
        return this.add( options );
    }
}
module.exports = TempLinks;