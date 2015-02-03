﻿/// <reference path="ModuleDefinition.ts" />

module ModuleDefinition {

    export class EndlessScroll {

        private _currentPage: number = 1;
        private _lastPage: number = 1;
        private _numberOfPages: number = -1;
        private _isLoading: boolean = false;
        private _stopped: boolean = false;

        private _pages: { [i: number]: any; } = {};
        private _pagesUrl: { [i: number]: string; } = {};

        get stopped(): boolean {
            return this._stopped;
        }
        set stopped(v:boolean) {
            this._stopped = v;
        }
        get currentPage():number {
            return this._currentPage;
        }

        get lastPage(): number {
            return this._numberOfPages;
        }

        canHandle(): boolean {
            throw 'canHandle() not implemented';
        }

        hasPages(dom): boolean {
            return $(dom).find('.pagination__navigation').length != 0;
        }

        getNavigationElement(dom): JQuery {
            return $(dom).find('.pagination__navigation').first();
        }

        createPageContainerElement(): JQuery {
            throw 'createPageContainerElement() not implemented';
        }

        getItemsElement(dom): JQuery {
            throw 'getItemsElement() not implemented';
        }

        getItems(dom): JQuery {
            throw 'getItems() not implemented';
        }

        createControlElement(el:JQuery): void {
            var controlContainer = $('<div>').addClass('pull-right').addClass('endless_control_element');
            var controlStartStop = $('<a>').attr('href', '#').append('<i class="fa fa-pause"></i>').attr('title', 'Pause/Resume endless scrolling');

            controlStartStop.click(() => {
                this.stopped != this.stopped;

                $('.endless_control_element a i.fa').toggleClass('fa-pause').toggleClass('fa-play');

                return false;
            });

            controlContainer.append(controlStartStop);

            el.append(controlContainer);
        }

        createLoadingElement(): JQuery {
            var el = $('<div class="table__heading loading_es"><div class="table__column--width-fill"><p><i class="fa fa-refresh fa-spin"></i> Loading next page...</p></div></div>');
            this.createControlElement(el.find('p'));

            return el;
        }

        createPageElement(page: number): JQuery {

            var el = $('<div class="table__heading"><div class="table__column--width-fill"><p></p></div></div>');

            if (page > 0) {
                if (this._numberOfPages > 0)
                    el.find('p').text('Page ' + page + ' of ' + this._numberOfPages);
                else
                    el.find('p').text('Page ' + page);
            } else {
                el.find('p').text('Last page ends here');
            }

            this.createControlElement(el.find('p'));

            return el;
        }

        loadNextPage(): void {
            if (this._isLoading || this._stopped) {
                return;
            }

            this._isLoading = true;
            this._currentPage++;
            
            if (this._currentPage > this._lastPage) {
                //this.addLastPageElement();
                return;
            }

            this.loadPage(this._currentPage);
        }

        loadPage(page: number): void {

            if (!(this._currentPage in this._pagesUrl)) {
                throw 'No URL for page ' + this._currentPage;
            }

            var url = this._pagesUrl[this._currentPage];
            
            var diff = -1;
            var target = -1;

            // Get nearest page
            $.each(this._pages, function (i, el) {
                var thisDiff = Math.abs(i - page);

                if (target == -1 || diff > thisDiff) {
                    target = i;
                    diff = thisDiff;
                }
            });

            var pageContainer = this.createPageContainerElement();
            var loadingElement = this.createLoadingElement();

            pageContainer.append(loadingElement);

            this._pages[page] = {
                element: pageContainer,
                loaded: false,
            }

            // Todo: Support reverse order
            var elPage: JQuery = this._pages[target].element;

            if (target < page) {
                elPage.after(pageContainer);
            } else {
                elPage.before(pageContainer);
            }

            $.get(url,(data) => {

                var dom = $.parseHTML(data);

                this.beforeAddItems(dom);

                pageContainer.prepend(this.createPageElement(page));

                var itemsContainer = this.getItemsElement(dom);

                this.addItems(itemsContainer, pageContainer);

                // Update navigation on page
                var newPagination = this.getNavigationElement(dom);
                this.getNavigationElement(document).html(newPagination.html());

                // Cache urls for pages
                this.parseNavigation(newPagination);

                this._pages[page].loaded = true;

                loadingElement.remove();

                this._isLoading = false;
            });
        }

        beforeAddItems(dom): void {
        }

        addItems(dom, pageContainer: JQuery): void {
            var items = this.getItems(dom);

            items.each(function (i: number, el: Element) {
                pageContainer.append(el);
            });
        }

        parseNavigation(dom: JQuery): void {
            dom.find('a').each((i: number, el: Element) => {
                var $el = $(el);
                var page = parseInt($el.data('page-number'));

                this._pagesUrl[page] = $el.attr('href');

                if (page > this._lastPage)
                    this._lastPage = page;
            });
        }

        preparePage(): void {
            // Check that current page can be handled and navigation exists in page 
            if (!this.canHandle())
                return;

            if (!this.hasPages(document)) {
                this._currentPage = 1;
                this._lastPage = 1;
            } else {

                var nav = this.getNavigationElement(document);

                var elLastPage = nav.find('a').last();

                this._currentPage = parseInt(nav.find('a.is-selected').data('page-number'));
                this._lastPage = parseInt(elLastPage.data('page-number'));

                if (elLastPage.text().trim() == "Last") {
                    this._numberOfPages = this._lastPage;
                }

                this.parseNavigation(nav);
            }

            console.log(this._pagesUrl);

            this._pages[this._currentPage] = {
                element: this.getItemsElement(document),
                loaded: true,
            };

            if (this._currentPage != 1) {
                return;
            }

            $(window).scroll((event) => {
                var scrollPos = $(window).scrollTop() + $(window).height();

                if (scrollPos > $('div.pagination').position().top - 200) {
                    this.loadNextPage();
                }
            });
        }

    }

} 