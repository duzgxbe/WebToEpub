/*
  Parses gravitytales.com
*/
"use strict";

parserFactory.register("gravitytales.com", function() { return new GravityTalesParser() });

class GravityTalesParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let that = this;
        let content = that.findContent(dom);
        let chapters = util.hyperlinksToChapterList(content, that.isChapterHref);
        return Promise.resolve(chapters);
    }

    isChapterHref(link) {
        return (link.hostname === "gravitytales.com") &&
            (link.search === "");
    }

    extractTitle(dom) {
        return util.getElement(dom, "meta", e => (e.getAttribute("property") === "og:title")).getAttribute("content");
    }

    // find the node(s) holding the story content
    findContent(dom) {
        return util.getElement(dom, "div", e => e.className.startsWith("entry-content"));
    }

    customRawDomToContentStep(chapter, content) {
        this.removeNextAndPreviousChapterHyperlinks(content);
        util.removeLeadingWhiteSpace(content);
        this.addTitleToContent(chapter.rawDom, content);
    }

    addTitleToContent(dom, content) {
        let that = this;
        let title = that.findChapterTitle(dom);
        if (title !== null) {
            content.insertBefore(title, content.firstChild);
        };
    }

    findChapterTitle(dom) {
        return util.getElement(dom, "h1", e => (e.className === "entry-title"));
    }

    findParentNodeOfChapterLinkToRemoveAt(link) {
        // "previous" chapter may be immediate child of <p> tag to remove
        // "next" chapter has a <strong> tag wrapping it, then the maybe a <p> tag
        let toRemove = util.moveIfParent(link, "strong");
        return util.moveIfParent(toRemove, "p");
    }

    populateUI(dom) {
        super.populateUI(dom);
        CoverImageUI.showCoverImageUrlInput(true);
    }
}