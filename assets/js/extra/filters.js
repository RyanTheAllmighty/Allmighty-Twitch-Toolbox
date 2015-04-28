app.filter('capitalize', function () {
    return function (input, all) {
        if (input != null) {
            input = input.toLowerCase();
        }

        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }
});

app.filter('autolink', function () {
    var linker = new AutoLinker({
        email: false,
        phone: false
    });
    return function (input, all) {
        return linker.link(input).replace('href=', 'ng-click="openLinkInBrowser()" href=');
    }
});