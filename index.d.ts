export = TempLinks;
declare class TempLinks {
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
    constructor(options?: {
        timeOut: number;
        inteval: number;
        oneTime: boolean;
        method: string;
        refs: any;
        redirect: string;
        callback: Function;
    });
    timeOut: number;
    oneTime: boolean;
    method: string;
    refs: any;
    redirect: string;
    callback: Function;
    paramName: any;
    links: {};
    /**
     * @param {Object} links - A list of links that was exported previously
     * @param {Function} callback - A middleware callback you want to associate to imported links
    */
    import(links: Object, callback?: Function): void;
    export(): Object;
    parser(): (req: Object, res: Object, next: Function) => Function;
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
    add(options?: {
        timeOut: number;
        oneTime: boolean;
        method: string;
        refs: any;
        redirect: string;
        callback: Function;
    }): string;
    /**
     *
     * @param {Object}      options             - Options object
     * @param {number}      options.timeOut     - Link timeout in seconds
     * @param {boolean}     options.oneTime     - Delete link once is accessed
     * @param {*}           options.refs        - Any refs you want to add to req when the link is accessed
     * @param {string}      options.redirect    - A string that will be passed to res.redirect method when the link is accessed
     * @param {Function}    options.callback    - A middleware callback you want to launch when the link is accessed
     */
    get(options?: {
        timeOut: number;
        oneTime: boolean;
        refs: any;
        redirect: string;
        callback: Function;
    }): string;
    /**
     *
     * @param {Object}      options             - Options object
     * @param {number}      options.timeOut     - Link timeout in seconds
     * @param {boolean}     options.oneTime     - Delete link once is accessed
     * @param {*}           options.refs        - Any refs you want to add to req when the link is accessed
     * @param {string}      options.redirect    - A string that will be passed to res.redirect method when the link is accessed
     * @param {Function}    options.callback    - A middleware callback you want to launch when the link is accessed
     */
    post(options?: {
        timeOut: number;
        oneTime: boolean;
        refs: any;
        redirect: string;
        callback: Function;
    }): string;
}
