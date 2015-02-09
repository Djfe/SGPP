﻿/// <reference path="ModuleDefinition.ts" />

module ModuleDefinition{

    export class Core implements SteamGiftsModule {

        private _sgLocation: SGLocation;
        private _debug = true;
        private _settings: ModuleDefinition.Settings = new ModuleDefinition.Settings();

        get settings(): Settings {
            return this._settings;
        }
        
        get location(): SGLocation {
            return this._sgLocation;
        }

        modules: { [s: string]: ModuleDefinition.SteamGiftsModule; } = {};


        style = "";

        private resolvePath = () => {
            var hash = "";
            var pageKind = "";
            var code = "";
            var description = "";
            var subpage = "";
            var windowLocation = window.location;

            if (windowLocation.hash.length > 1)
                hash = windowLocation.hash.substring(1);

            if (windowLocation.pathname == '/') {
                pageKind = "giveaways";
            } else {
                var split = windowLocation.pathname.split("/").filter(function (a, b, c) { return Boolean(a) });

                pageKind = split[0] || '';
                description = split[2] || '';

                if (split[0] == 'giveaway' || split[0] == 'trade' || split[0] == 'discussion' || split[0] == 'user') {
                    subpage = (split[3] == 'search' ? '' : split[3]) || '';
                    code = split[1] || '';
                } else {
                    subpage = split[1] || '';
                }

            }

            var match,
                pl = /\+/g,
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query = windowLocation.search.substring(1);
            var urlParams = {};
            while (match = search.exec(query)) {
                urlParams[decode(match[1])] = decode(match[2]);
            }

            this._sgLocation = {
                pageKind: pageKind,
                code: code,
                description: description,
                subpage: subpage,
                hash: hash,
                parameters: urlParams
            }
        }

        constructor() {
            this.init();
        }

        init = () => {
            this.resolvePath();
            this._settings.init();
        }

        render(): void {
            this._settings.render();
        }

        name(): string {
            return "Core";
        }

        shouldRun(location: SGLocation): boolean{
            return true;
        }

        log = (msg: string) => {
            if(this._debug)
                console.log("[" + new Date() + "] SGPP - " + msg);
        };
    }

}